import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing...');

    const body = await request.json();
    const { 
      invoiceId, 
      employeeId, 
      employeeName, 
      employeeEmail, 
      reimbursementAmount, 
      currency, 
      expenseCategory, 
      businessPurpose, 
      reimbursementDate 
    } = body;

    // Validate required fields
    if (!invoiceId || !employeeId || !employeeName || !reimbursementAmount || !businessPurpose) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, employeeId, employeeName, reimbursementAmount, businessPurpose' },
        { status: 400 }
      );
    }

    // Validate reimbursement amount
    if (reimbursementAmount <= 0) {
      return NextResponse.json(
        { error: 'Reimbursement amount must be greater than 0' },
        { status: 400 }
      );
    }



    // Dynamic import to avoid build issues
    const { submitReimbursementTool } = await import('@/mastra/tools/supabase-operations');

    // Submit the reimbursement using the tool
    const result = await submitReimbursementTool.execute({
      context: {
        invoiceId,
        employeeId,
        employeeName,
        employeeEmail,
        reimbursementAmount: parseFloat(reimbursementAmount),
        currency: currency || 'USD',
        expenseCategory,
        businessPurpose,
        reimbursementDate,
      }
    });

    const response = {
      success: result.success,
      message: result.message,
      data: {
        reimbursementId: result.reimbursementId,
        invoiceId,
        employeeName,
        reimbursementAmount: parseFloat(reimbursementAmount),
        currency: currency || 'USD',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const statusCode = result.success ? 200 : 400;



    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('❌ Reimbursement submission API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during reimbursement submission',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 