import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Loading...');

    // Fetch comprehensive dashboard data in parallel
    const [invoicesResult, reimbursementsResult, activityResult] = await Promise.allSettled([
      // Get all invoices with stats
      supabase
        .from('invoices')
        .select('id, amount, status, created_at, invoice_date, vendor_name, invoice_number')
        .order('created_at', { ascending: false }),
      
      // Get all reimbursements with stats  
      supabase
        .from('reimbursements')
        .select('id, reimbursement_amount, status, created_at, employee_name')
        .order('created_at', { ascending: false }),
      
      // Get recent activity (last 10 invoices and reimbursements)
      supabase
        .from('invoices')
        .select('id, invoice_number, vendor_name, status, created_at, amount')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Process invoices data
    const invoicesData = invoicesResult.status === 'fulfilled' ? invoicesResult.value.data || [] : [];
    const reimbursementsData = reimbursementsResult.status === 'fulfilled' ? reimbursementsResult.value.data || [] : [];
    const recentInvoices = activityResult.status === 'fulfilled' ? activityResult.value.data || [] : [];

    // Calculate invoice statistics
    const totalInvoices = invoicesData.length;
    const pendingInvoices = invoicesData.filter(inv => inv.status === 'pending').length;
    const processedInvoices = invoicesData.filter(inv => inv.status === 'approved' || inv.status === 'paid').length;
    const totalAmount = invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Calculate reimbursement statistics
    const reimbursementsPending = reimbursementsData.filter(reimb => reimb.status === 'pending').length;
    const reimbursementsProcessed = reimbursementsData.filter(reimb => reimb.status === 'approved' || reimb.status === 'paid').length;

    // Calculate monthly statistics (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyInvoices = invoicesData.filter(inv => {
      const invDate = new Date(inv.created_at);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    });
    const monthlyAmount = monthlyInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Calculate success rate (approved vs total)
    const successfulInvoices = invoicesData.filter(inv => inv.status === 'approved' || inv.status === 'paid').length;
    const successRate = totalInvoices > 0 ? (successfulInvoices / totalInvoices * 100) : 100;

    // Calculate average processing time (mock for now - would need more data tracking)
    const avgProcessingTime = 2.1; // Hours

    // Generate recent activity from actual data
    const recentActivity = recentInvoices.map((invoice, index) => ({
      id: index + 1,
      type: 'invoice_uploaded',
      title: 'Invoice Uploaded',
      description: `Invoice ${invoice.invoice_number} from ${invoice.vendor_name}`,
      timestamp: getRelativeTime(invoice.created_at),
      status: invoice.status,
      amount: invoice.amount
    }));

    // Add reimbursement activity
    const recentReimbursements = reimbursementsData.slice(0, 3).map((reimb, index) => ({
      id: recentActivity.length + index + 1,
      type: 'reimbursement_processed',
      title: 'Reimbursement Request',
      description: `Reimbursement submitted by ${reimb.employee_name}`,
      timestamp: getRelativeTime(reimb.created_at),
      status: reimb.status,
      amount: reimb.reimbursement_amount
    }));

    const allActivity = [...recentActivity, ...recentReimbursements]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    // Generate pending tasks based on actual data
    const pendingTasks = [];
    
    if (pendingInvoices > 0) {
      pendingTasks.push({
        title: `Review ${pendingInvoices} pending invoice${pendingInvoices > 1 ? 's' : ''}`,
        priority: 'high',
        time: '30m'
      });
    }
    
    if (reimbursementsPending > 0) {
      pendingTasks.push({
        title: `Process ${reimbursementsPending} reimbursement request${reimbursementsPending > 1 ? 's' : ''}`,
        priority: 'medium',
        time: '1h'
      });
    }

    // Add some general tasks
    pendingTasks.push(
      { title: 'Generate monthly expense report', priority: 'low', time: '2h' },
      { title: 'Update vendor database', priority: 'low', time: '1d' }
    );

    const response = {
      success: true,
      data: {
        statistics: {
          totalInvoices,
          pendingInvoices,
          processedInvoices,
          totalAmount,
          reimbursementsPending,
          reimbursementsProcessed,
          monthlyInvoices: monthlyInvoices.length,
          monthlyAmount,
          avgProcessingTime,
          successRate: Math.round(successRate * 10) / 10,
        },
        recentActivity: allActivity,
        pendingTasks: pendingTasks.slice(0, 5),
        insights: generateInsights(totalInvoices, pendingInvoices, totalAmount, successRate)
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Dashboard error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function generateInsights(totalInvoices: number, pendingInvoices: number, totalAmount: number, successRate: number): string[] {
  const insights = [];
  
  if (totalAmount > 50000) {
    insights.push(`High transaction volume: $${totalAmount.toLocaleString()} in total invoices`);
  } else {
    insights.push(`Current transaction volume: $${totalAmount.toLocaleString()}`);
  }
  
  if (pendingInvoices > 5) {
    insights.push(`${pendingInvoices} invoices need attention`);
  } else if (pendingInvoices > 0) {
    insights.push(`${pendingInvoices} pending invoice${pendingInvoices > 1 ? 's' : ''} to review`);
  } else {
    insights.push('All invoices are up to date');
  }
  
  if (successRate > 95) {
    insights.push('Processing efficiency is excellent');
  } else if (successRate > 85) {
    insights.push('Processing efficiency is good');
  } else {
    insights.push('Consider reviewing processing workflow');
  }
  
  return insights;
} 