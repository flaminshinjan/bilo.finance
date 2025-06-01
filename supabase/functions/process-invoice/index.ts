// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'
import { processFile } from '../_shared/process-file.ts'

console.log("Hello from Functions!")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get the employee record
    const { data: employeeData, error: employeeError } = await supabaseClient
      .from('employees')
      .select('id, company_id')
      .eq('user_id', user.id)
      .single()

    if (employeeError || !employeeData) {
      throw new Error('Employee not found')
    }

    // Get form data from request
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file uploaded')
    }

    // Process the file (upload to storage and get the path)
    const { filePath, fileType } = await processFile(file, supabaseClient)

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Convert the file to base64 for OpenAI
    const fileBuffer = await file.arrayBuffer()
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))

    // Use OpenAI's Vision API to extract invoice details
    const response = await openai.createChatCompletion({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the following information from this invoice: company name, invoice number, and total amount. Return the data in JSON format with keys: companyName, invoiceNo, amount"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64File}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const extractedData = JSON.parse(response.data.choices[0].message.content)

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .insert({
        invoice_no: extractedData.invoiceNo,
        company_name: extractedData.companyName,
        amount: extractedData.amount,
        status: 'pending',
        file_path: filePath,
        file_type: fileType,
        extracted_data: extractedData,
        employee_id: employeeData.id
      })
      .select()
      .single()

    if (invoiceError) {
      throw invoiceError
    }

    // Create reimbursement request
    const { data: reimbursement, error: reimbursementError } = await supabaseClient
      .from('reimbursements')
      .insert({
        invoice_id: invoice.id,
        employee_id: employeeData.id,
        amount: extractedData.amount,
        status: 'pending',
        description: `Reimbursement for invoice ${extractedData.invoiceNo} from ${extractedData.companyName}`
      })
      .select()
      .single()

    if (reimbursementError) {
      throw reimbursementError
    }

    return new Response(
      JSON.stringify({
        invoice,
        reimbursement,
        message: 'Invoice processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-invoice' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
