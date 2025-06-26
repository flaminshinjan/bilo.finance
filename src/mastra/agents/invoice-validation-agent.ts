import { Agent } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export const invoiceValidationAgent = new Agent({
  name: 'Invoice Validation Agent',
  instructions: `
You are an expert AI agent specialized in validating extracted invoice data for the Bilo Finance platform. You perform comprehensive quality checks and risk assessments on processed invoices.

**Core Responsibilities:**
1. **Data Quality Validation**: Check completeness, accuracy, and consistency of extracted data
2. **Business Rule Compliance**: Validate against company policies and approval rules
3. **Risk Assessment**: Identify potential fraud, duplicates, or suspicious patterns
4. **Amount Verification**: Cross-check calculations, taxes, and totals
5. **Vendor Validation**: Verify vendor information and payment details

**Validation Checks:**
- Required field completeness (invoice number, amount, vendor, date)
- Mathematical accuracy (line items sum to subtotal, tax calculations)
- Date validation (invoice date, due date reasonableness)
- Amount range validation (suspicious high/low amounts)
- Vendor name consistency and format validation
- Duplicate detection based on invoice number and vendor
- Tax rate and calculation verification

**Risk Factors:**
- Unusually high amounts for vendor or category
- Suspicious vendor names or addresses
- Duplicate invoice numbers
- Inconsistent tax calculations
- Missing critical information
- Unusual payment terms or dates

**Output Requirements:**
Provide detailed validation results with pass/warning/fail status for each check, overall risk assessment, and recommendations for manual review when needed.
`,
  model: anthropic('claude-sonnet-4-20250514'),
});

// Helper function to validate invoice data
export async function validateInvoiceData(extractedData: any, rawText: string) {
  try {
    console.log('✅ Invoice Validation Agent: Starting validation...');

    const outputSchema = z.object({
      validation_checks: z.array(z.object({
        check_name: z.string(),
        status: z.enum(['passed', 'warning', 'failed']),
        message: z.string(),
        details: z.string().optional(),
      })),
      business_rules: z.object({
        amount_within_limits: z.boolean(),
        vendor_approved: z.boolean(),
        tax_calculation_correct: z.boolean(),
        dates_valid: z.boolean(),
        required_fields_present: z.boolean(),
      }),
      risk_assessment: z.object({
        overall_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
        risk_factors: z.array(z.string()),
        confidence_score: z.number(),
        requires_manual_review: z.boolean(),
        fraud_indicators: z.array(z.string()),
      }),
      data_quality: z.object({
        completeness_score: z.number(),
        accuracy_score: z.number(),
        consistency_score: z.number(),
        missing_fields: z.array(z.string()),
        suspicious_values: z.array(z.string()),
      }),
      recommendations: z.object({
        action: z.enum(['approve', 'review', 'reject']),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        reviewer_notes: z.array(z.string()),
        next_steps: z.array(z.string()),
      }),
    });

    const response = await invoiceValidationAgent.generate(
      `Please perform comprehensive validation on this extracted invoice data.

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Raw Text (for reference):
${rawText}

Validation Tasks:
1. Check data completeness and accuracy
2. Validate business rule compliance
3. Assess risk factors and fraud indicators
4. Verify mathematical calculations
5. Evaluate data quality metrics
6. Provide actionable recommendations

Please provide detailed validation results with specific findings and recommendations.`,
      {
        output: outputSchema,
      }
    );

    return response;
  } catch (error) {
    console.error('❌ Invoice Validation Agent failed:', error);
    throw error;
  }
} 