import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting dashboard data...');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`📊 Aggregating dashboard data for user: ${userId}`);

    // Dynamic imports to avoid build issues
    const [
      { getDueInvoicesTool },
      { getUserPendingApprovals }
    ] = await Promise.all([
      import('@/mastra/tools/supabase-operations'),
      import('@/mastra/agents/approval-workflow-agent')
    ]);

    // Execute multiple agent operations in parallel for efficiency
    const [dueInvoicesResult, pendingApprovalsResult] = await Promise.allSettled([
      getDueInvoicesTool.execute({
        userId,
        daysAhead: 30,
      }),
      getUserPendingApprovals(userId, 10),
    ]);

    // Process due invoices result
    const dueInvoices = dueInvoicesResult.status === 'fulfilled' 
      ? dueInvoicesResult.value 
      : { invoices: [], totalAmount: 0, count: 0 };

    // Process pending approvals result  
    const pendingApprovals = pendingApprovalsResult.status === 'fulfilled'
      ? pendingApprovalsResult.value
      : { approvals: [], count: 0 };

    // Calculate statistics
    const statistics = {
      totalDueInvoices: dueInvoices.count,
      totalDueAmount: dueInvoices.totalAmount,
      pendingApprovals: Array.isArray(pendingApprovals.approvals) ? pendingApprovals.approvals.length : pendingApprovals.count,
      urgentItems: dueInvoices.invoices.filter((invoice: any) => invoice.days_until_due <= 7).length,
    };

    // Format urgent notifications
    const notifications = [];
    
    if (statistics.urgentItems > 0) {
      notifications.push({
        type: 'warning',
        message: `${statistics.urgentItems} invoice(s) due within 7 days`,
        priority: 'high',
      });
    }

    if (statistics.pendingApprovals > 0) {
      notifications.push({
        type: 'info',
        message: `${statistics.pendingApprovals} approval(s) waiting for your review`,
        priority: 'medium',
      });
    }

    const response = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        statistics,
        dueInvoices: {
          items: dueInvoices.invoices.slice(0, 5), // Top 5 most urgent
          totalCount: dueInvoices.count,
          totalAmount: dueInvoices.totalAmount,
        },
        pendingApprovals: {
          items: Array.isArray(pendingApprovals.approvals) 
            ? pendingApprovals.approvals.slice(0, 5) 
            : [],
          totalCount: Array.isArray(pendingApprovals.approvals) 
            ? pendingApprovals.approvals.length 
            : pendingApprovals.count,
        },
        notifications,
        insights: [
          dueInvoices.totalAmount > 50000 
            ? `High payment volume: $${dueInvoices.totalAmount.toLocaleString()} due in next 30 days`
            : `Manageable payment volume: $${dueInvoices.totalAmount.toLocaleString()} due in next 30 days`,
          statistics.urgentItems > 0
            ? `${statistics.urgentItems} urgent payment(s) require immediate attention`
            : 'No urgent payments requiring immediate attention',
          statistics.pendingApprovals > 3
            ? `Approval backlog detected: ${statistics.pendingApprovals} items pending`
            : 'Approval workflow running smoothly',
        ],
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Dashboard data compiled: ${statistics.totalDueInvoices} due invoices, ${statistics.pendingApprovals} pending approvals`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Dashboard API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 