import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Schema for extracted invoice data
const InvoiceDataSchema = z.object({
  invoiceNumber: z.string(),
  vendorName: z.string(),
  vendorAddress: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
  })),
  taxAmount: z.number().optional(),
  subtotal: z.number().optional(),
  paymentTerms: z.string().optional(),
});

export const extractInvoiceDataTool = new Tool({
  id: 'extract-invoice-data',
  description: 'Extract structured data from invoice PDFs or images using advanced OCR and AI analysis',
  inputSchema: z.object({
    fileBuffer: z.instanceof(Buffer),
    fileName: z.string(),
    mimeType: z.string(),
  }),
  outputSchema: z.object({
    extractedData: InvoiceDataSchema,
    confidence: z.number(),
    rawText: z.string(),
    method: z.enum(['pdf-text', 'ocr-image']),
  }),
  execute: async ({ context: { fileBuffer, fileName, mimeType } }) => {

    
    try {
      let rawText = '';
      let method: 'pdf-text' | 'ocr-image' = 'ocr-image';

      if (mimeType === 'application/pdf') {
        console.log('📄 Processing PDF file...');
        try {
          // Try to extract text from PDF
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(fileBuffer);
          rawText = pdfData.text;
        method = 'pdf-text';

        } catch (pdfError) {
          console.log('⚠️ PDF text extraction failed, falling back to OCR...');
          // If PDF text extraction fails, treat as image for OCR
          const base64Pdf = fileBuffer.toString('base64');
          const pdfUrl = `data:${mimeType};base64,${base64Pdf}`;
          
          const { text } = await generateText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: DETAILED_OCR_PROMPT
                  },
                  {
                    type: 'image',
                    image: pdfUrl
                  }
                ]
              }
            ],
          });
          
          rawText = text;
          method = 'ocr-image';
        }
      } else if (mimeType.startsWith('image/')) {
        console.log('🖼️ Processing image file...');
        const base64Image = fileBuffer.toString('base64');
        const imageUrl = `data:${mimeType};base64,${base64Image}`;
        
        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: DETAILED_OCR_PROMPT
                },
                {
                  type: 'image',
                  image: imageUrl
                }
              ]
            }
          ],
        });
        
        rawText = text;
        method = 'ocr-image';
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }



      // Use Claude to parse the extracted text into structured data with enhanced prompt
      const { text: structuredDataText } = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        messages: [
          {
            role: 'user',
            content: ENHANCED_PARSING_PROMPT.replace('{{RAW_TEXT}}', rawText)
          }
        ],
      });

      console.log('🧠 AI structured response:', structuredDataText);

      // Parse the JSON response from Claude
      let extractedData;
      try {
        // Clean the response in case it has markdown formatting
        const cleanedResponse = structuredDataText.replace(/```json\n?|\n?```/g, '').trim();
        extractedData = JSON.parse(cleanedResponse);
        
        // Validate and sanitize the extracted data
        extractedData = validateAndSanitizeData(extractedData);
        
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.log('Raw AI response:', structuredDataText);
        // Enhanced fallback parsing
        extractedData = enhancedParseInvoiceText(rawText, fileName);
      }

      const confidence = calculateConfidence(extractedData, rawText, method);

      

      return {
        extractedData,
        confidence,
        rawText,
        method,
      };
    } catch (error) {
      console.error('❌ Invoice data extraction failed:', error);
      throw new Error(`Failed to extract invoice data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

const DETAILED_OCR_PROMPT = `Please extract ALL text content from this invoice document with extreme precision. Focus on capturing every piece of text exactly as it appears, including:

**Header Information:**
- Company/vendor name and full address
- Invoice number (may be labeled as "Invoice #", "INV", "Invoice No.", etc.)
- Invoice date and due date
- Bill-to/Customer information

**Financial Details:**
- All line items with descriptions, quantities, unit prices, and totals
- Subtotal, tax amounts, and final total
- Currency symbols and amounts
- Discount information if present

**Additional Details:**
- Payment terms (Net 30, Due on receipt, etc.)
- Tax IDs, account numbers
- Reference numbers, PO numbers
- Contact information (phone, email, website)

**Instructions:**
1. Preserve the original structure and formatting
2. Include ALL numbers exactly as shown (with currency symbols, commas, decimals)
3. Capture complete addresses with line breaks
4. Include any special characters, symbols, or formatting
5. If text is unclear, note [UNCLEAR] but include your best interpretation

Return the complete text content maintaining the document's logical structure.`;

const ENHANCED_PARSING_PROMPT = `You are an expert invoice data extraction specialist. Analyze the following invoice text and extract structured data with maximum accuracy.

**CRITICAL INSTRUCTIONS:**
1. Extract data EXACTLY as it appears in the document
2. For amounts: extract only the numerical value (remove currency symbols, commas)
3. For dates: convert to YYYY-MM-DD format 
4. For line items: capture ALL items, even if they span multiple lines
5. Be extremely careful with decimal places and amounts
6. If information is missing or unclear, use null for optional fields

**INVOICE TEXT:**
{{RAW_TEXT}}

**REQUIRED OUTPUT FORMAT:**
Return ONLY a valid JSON object with this exact structure:

{
  "invoiceNumber": "string (exact invoice number from document)",
  "vendorName": "string (company/vendor name exactly as shown)",
  "vendorAddress": "string (complete address or null if not found)",
  "amount": number (final total amount as number only),
  "currency": "string (currency code, default USD if not specified)",
  "invoiceDate": "YYYY-MM-DD (invoice date)",
  "dueDate": "YYYY-MM-DD or null (due date if present)",
  "lineItems": [
    {
      "description": "string (item description)",
      "quantity": number (quantity as number),
      "unitPrice": number (unit price as number),
      "totalPrice": number (line total as number)
    }
  ],
  "taxAmount": number or null (tax amount if present),
  "subtotal": number or null (subtotal before tax if present),
  "paymentTerms": "string or null (payment terms if present)"
}

**VALIDATION RULES:**
- All amounts must be numbers only (no currency symbols or commas)
- Dates must be in YYYY-MM-DD format
- Line items array must contain at least one item
- Total amount should equal sum of line items plus tax
- Invoice number should be the actual number from the document

Extract data with precision and return ONLY the JSON object.`;

function validateAndSanitizeData(data: any): z.infer<typeof InvoiceDataSchema> {
  // Sanitize and validate extracted data
  const sanitized = {
    invoiceNumber: String(data.invoiceNumber || `INV-${Date.now()}`),
    vendorName: String(data.vendorName || 'Unknown Vendor'),
    vendorAddress: data.vendorAddress ? String(data.vendorAddress) : undefined,
    amount: parseFloat(String(data.amount || 0)),
    currency: String(data.currency || 'USD'),
    invoiceDate: validateDate(data.invoiceDate) || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate ? (validateDate(data.dueDate) || undefined) : undefined,
    lineItems: Array.isArray(data.lineItems) ? data.lineItems.map((item: any) => ({
      description: String(item.description || 'Service/Product'),
      quantity: parseFloat(String(item.quantity || 1)),
      unitPrice: parseFloat(String(item.unitPrice || 0)),
      totalPrice: parseFloat(String(item.totalPrice || 0)),
    })) : [],
    taxAmount: data.taxAmount ? parseFloat(String(data.taxAmount)) : undefined,
    subtotal: data.subtotal ? parseFloat(String(data.subtotal)) : undefined,
    paymentTerms: data.paymentTerms ? String(data.paymentTerms) : undefined,
  };

  // Ensure at least one line item exists
  if (sanitized.lineItems.length === 0) {
    sanitized.lineItems = [{
      description: 'Service/Product',
      quantity: 1,
      unitPrice: sanitized.amount,
      totalPrice: sanitized.amount,
    }];
  }

  return sanitized;
}

function validateDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  try {
    // Handle various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing common formats
      const formats = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // MM/DD/YYYY or DD/MM/YYYY
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,    // YYYY/MM/DD
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          const [, p1, p2, p3] = match;
          let year, month, day;
          
          if (p1.length === 4) {
            // YYYY/MM/DD format
            [year, month, day] = [parseInt(p1), parseInt(p2), parseInt(p3)];
          } else {
            // MM/DD/YYYY or DD/MM/YYYY format
            year = parseInt(p3);
            if (year < 100) year += 2000; // Convert 2-digit year
            
            // Assume MM/DD/YYYY for US format
            month = parseInt(p1);
            day = parseInt(p2);
          }
          
          const parsedDate = new Date(year, month - 1, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
      }
      return null;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function enhancedParseInvoiceText(rawText: string, fileName: string): z.infer<typeof InvoiceDataSchema> {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Enhanced pattern matching for better extraction
  const invoiceNumberPatterns = [
    /(?:invoice|inv|bill|receipt)[\s#:]*([A-Z0-9\-]+)/i,
    /(?:number|no|#)[\s:]*([A-Z0-9\-]+)/i,
    /([A-Z]{2,}\-\d+)/,
  ];
  
  const amountPatterns = [
    /(?:total|amount\s+due|grand\s+total|balance\s+due)[\s:]*\$?([\d,]+\.?\d*)/i,
    /\$?([\d,]+\.?\d*)\s*(?:total|due)/i,
  ];
  
  const datePatterns = [
    /(?:date|dated|issued)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  ];
  
  const dueDatePatterns = [
    /(?:due[\s\w]*date|payment[\s\w]*due)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ];
  
  // Extract invoice number
  let invoiceNumber = `INV-${Date.now()}`;
  for (const pattern of invoiceNumberPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      invoiceNumber = match[1];
      break;
    }
  }

  // Extract amount
  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Extract dates
  let invoiceDate = new Date().toISOString().split('T')[0];
  let dueDate: string | undefined;
  
  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const validatedDate = validateDate(match[1]);
      if (validatedDate) {
        invoiceDate = validatedDate;
        break;
      }
    }
  }
  
  for (const pattern of dueDatePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const validatedDate = validateDate(match[1]);
      if (validatedDate) {
        dueDate = validatedDate;
        break;
      }
    }
  }

  // Enhanced vendor name extraction
  let vendorName = 'Unknown Vendor';
  const firstFewLines = lines.slice(0, 8);
  
  for (const line of firstFewLines) {
    // Look for company names (typically in caps or proper case)
    if (line.match(/^[A-Z][a-zA-Z\s&.,'"]+(?:Inc|LLC|Corp|Ltd|Corporation|Company|Co\.|L\.P\.|LLP)?\.?$/)) {
      vendorName = line;
      break;
    }
  }
  
  if (vendorName === 'Unknown Vendor') {
    // Try extracting from filename
    vendorName = fileName
      .replace(/[_-]/g, ' ')
      .replace(/\.(pdf|png|jpg|jpeg)$/i, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Enhanced line items extraction
  const lineItems = enhancedExtractLineItems(rawText);

  return {
    invoiceNumber,
    vendorName,
    amount,
    currency: 'USD',
    invoiceDate,
    dueDate,
    lineItems: lineItems.length > 0 ? lineItems : [{
      description: 'Service/Product',
      quantity: 1,
      unitPrice: amount,
      totalPrice: amount,
    }],
  };
}

function enhancedExtractLineItems(rawText: string): Array<{
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}> {
  const lines = rawText.split('\n').map(line => line.trim());
  const lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> = [];
  
  // Multiple patterns for different invoice layouts
  const patterns = [
    // Pattern 1: Description Qty Price Total
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)$/,
    // Pattern 2: Description Price
    /^(.+?)\s+\$?([\d,]+\.?\d*)$/,
    // Pattern 3: Qty Description Unit Price Total
    /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)$/,
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let description, quantity, unitPrice, totalPrice;
        
        if (pattern === patterns[0]) {
          // Description Qty Price Total
          [, description, quantity, unitPrice, totalPrice] = match;
          lineItems.push({
            description: description.trim(),
            quantity: parseFloat(quantity),
            unitPrice: parseFloat(unitPrice.replace(/,/g, '')),
            totalPrice: parseFloat(totalPrice.replace(/,/g, '')),
          });
        } else if (pattern === patterns[1]) {
          // Description Price (assume qty = 1)
          [, description, totalPrice] = match;
          const price = parseFloat(totalPrice.replace(/,/g, ''));
          lineItems.push({
            description: description.trim(),
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
          });
        } else if (pattern === patterns[2]) {
          // Qty Description Unit Price Total
          [, quantity, description, unitPrice, totalPrice] = match;
      lineItems.push({
        description: description.trim(),
            quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice.replace(/,/g, '')),
        totalPrice: parseFloat(totalPrice.replace(/,/g, '')),
      });
        }
        break;
      }
    }
  }
  
  return lineItems;
}

function calculateConfidence(
  extractedData: z.infer<typeof InvoiceDataSchema>,
  rawText: string,
  method: 'pdf-text' | 'ocr-image'
): number {
  let confidence = method === 'pdf-text' ? 0.85 : 0.75; // Base confidence

  // Boost confidence based on data quality
  if (extractedData.invoiceNumber && !extractedData.invoiceNumber.startsWith('INV-')) {
    confidence += 0.08;
  }
  if (extractedData.amount > 0 && extractedData.amount < 1000000) {
    confidence += 0.06;
  }
  if (extractedData.vendorName && extractedData.vendorName !== 'Unknown Vendor') {
    confidence += 0.08;
  }
  if (rawText.length > 200) {
    confidence += 0.05;
  }
  if (extractedData.dueDate) {
    confidence += 0.03;
  }
  if (extractedData.lineItems.length > 1) {
    confidence += 0.04;
  }
  if (extractedData.vendorAddress) {
    confidence += 0.03;
  }
  if (extractedData.taxAmount !== undefined) {
    confidence += 0.02;
  }

  return Math.min(confidence, 1.0);
} 