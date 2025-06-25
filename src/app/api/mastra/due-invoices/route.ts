import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Getting due invoices...');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');
    const status = searchParams.get('status');

    // Dynamic import to avoid build issues
    const { getDueInvoicesTool } = await import('@/mastra/tools/supabase-operations');

    // Execute the due invoices tool
    const result = await getDueInvoicesTool.execute({
      userId: userId || undefined,
      daysAhead,
      status: status || undefined,
    });

    const response = {
      success: true,
      message: `Found ${result.count} due invoices`,
      data: {
        invoices: result.invoices,
        totalAmount: result.totalAmount,
        count: result.count,
        daysAhead,
        filters: {
          userId: userId || 'all',
          status: status || 'all',
        },
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Due invoices retrieved: ${result.count} invoices, $${result.totalAmount.toLocaleString()} total`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Due invoices API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve due invoices',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 