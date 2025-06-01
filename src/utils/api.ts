import { supabase } from './supabase'

export async function uploadInvoice(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data: functionData, error: functionError } = await supabase.functions.invoke(
    'process-invoice',
    {
      body: formData
    }
  )

  if (functionError) {
    throw functionError
  }

  return functionData
}

export async function processReimbursements(reimbursementIds: string[]) {
  const { data: functionData, error: functionError } = await supabase.functions.invoke(
    'process-reimbursements',
    {
      body: { reimbursementIds }
    }
  )

  if (functionError) {
    throw functionError
  }

  return functionData
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      reimbursements (
        id,
        amount,
        status,
        description
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getReimbursements() {
  const { data, error } = await supabase
    .from('reimbursements')
    .select(`
      *,
      invoice:invoices(*),
      employee:employees(
        *,
        company:companies(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function updateReimbursementStatus(
  reimbursementId: string,
  status: 'approved' | 'rejected'
) {
  const { data, error } = await supabase
    .from('reimbursements')
    .update({ status })
    .eq('id', reimbursementId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteInvoice(invoiceId: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) {
    throw error
  }
} 