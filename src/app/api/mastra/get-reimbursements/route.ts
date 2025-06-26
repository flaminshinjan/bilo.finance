import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Loading...');

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }



    // Dynamic import to avoid build issues
    const { getUserReimbursementsTool } = await import('@/mastra/tools/supabase-operations');

    // Get reimbursements using the tool
    const result = await getUserReimbursementsTool.execute({
      context: {
        employeeId,
        status,
        limit,
      }
    });

    const response = {
      success: true,
      message: `Found ${result.count} reimbursements`,
      data: {
        reimbursements: result.reimbursements,
        totalAmount: result.totalAmount,
        count: result.count,
      },
      timestamp: new Date().toISOString(),
    };



    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Get reimbursements API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while getting reimbursements',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 