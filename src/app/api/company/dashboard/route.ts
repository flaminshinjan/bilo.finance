import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get company ID from query or header (in a real app, this would come from auth token)
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get employees count for this company
    const { data: employees, error: employeesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('company_id', companyId);

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
    }

    // Get reimbursements for this company
    const { data: reimbursements, error: reimbursementsError } = await supabase
      .from('reimbursements')
      .select(`
        *,
        profiles!reimbursements_user_id_fkey!inner(company_id, full_name, email)
      `)
      .eq('profiles.company_id', companyId)
      .order('created_at', { ascending: false });

    if (reimbursementsError) {
      console.error('Error fetching reimbursements:', reimbursementsError);
    }

    // Calculate statistics
    const totalEmployees = employees?.length || 0;
    const totalReimbursements = reimbursements?.length || 0;
    const pendingReimbursements = reimbursements?.filter(r => r.status === 'pending').length || 0;
    const approvedReimbursements = reimbursements?.filter(r => r.status === 'approved').length || 0;
    const rejectedReimbursements = reimbursements?.filter(r => r.status === 'rejected').length || 0;

    // Calculate total amounts
    const totalAmount = reimbursements?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
    const approvedAmount = reimbursements?.filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
    const pendingAmount = reimbursements?.filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

    // Get recent activity (last 10 reimbursements)
    const recentActivity = reimbursements?.slice(0, 10).map(r => ({
      id: r.id,
      type: 'reimbursement',
      description: `${r.profiles?.full_name} submitted a reimbursement for $${r.amount}`,
      amount: r.amount,
      status: r.status,
      timestamp: r.created_at,
      employee: r.profiles?.full_name
    })) || [];

    // Monthly statistics (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthReimbursements = reimbursements?.filter(r => {
        const reimbDate = new Date(r.created_at);
        return reimbDate >= monthStart && reimbDate <= monthEnd;
      }) || [];

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        totalAmount: monthReimbursements.reduce((sum, r) => sum + (r.amount || 0), 0),
        requestCount: monthReimbursements.length,
        approvedCount: monthReimbursements.filter(r => r.status === 'approved').length
      });
    }

    const dashboardData = {
      statistics: {
        totalEmployees,
        totalReimbursements,
        pendingReimbursements,
        approvedReimbursements,
        rejectedReimbursements,
        totalAmount,
        approvedAmount,
        pendingAmount,
        approvalRate: totalReimbursements > 0 ? Math.round((approvedReimbursements / totalReimbursements) * 100) : 0
      },
      recentActivity,
      monthlyStats,
      employees: employees || [],
      pendingRequests: reimbursements?.filter(r => r.status === 'pending').map(r => ({
        id: r.id,
        employee: r.profiles?.full_name,
        amount: r.amount,
        description: r.description,
        category: r.category,
        created_at: r.created_at,
        receipt_url: r.receipt_url
      })) || []
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 