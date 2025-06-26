import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') || '6months';

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case '6months':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
    }

    // Get reimbursements with profile data for the specified period
    const { data: reimbursements, error: reimbursementsError } = await supabase
      .from('reimbursements')
      .select(`
        *,
        profiles!reimbursements_user_id_fkey!inner (
          id,
          full_name,
          email,
          department,
          company_id
        )
      `)
      .eq('profiles.company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (reimbursementsError) {
      console.error('Error fetching reimbursements:', reimbursementsError);
      return NextResponse.json({ error: 'Failed to fetch reimbursements' }, { status: 500 });
    }

    // Calculate summary statistics
    const totalSpending = reimbursements.reduce((sum, r) => sum + r.amount, 0);
    const totalRequests = reimbursements.length;
    const approvedRequests = reimbursements.filter(r => r.status === 'approved').length;
    const overallApprovalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;
    
    // Calculate average processing time (for approved/rejected requests)
    const processedRequests = reimbursements.filter(r => r.status !== 'pending' && r.approved_at);
    const averageProcessingTime = processedRequests.length > 0 
      ? Math.round(processedRequests.reduce((sum, r) => {
          const created = new Date(r.created_at);
          const processed = new Date(r.approved_at);
          const diffDays = (processed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0) / processedRequests.length)
      : 0;

    // Generate monthly data
    const monthlyMap = new Map<string, { totalAmount: number; requestCount: number; approvedCount: number }>();
    
    reimbursements.forEach(r => {
      const date = new Date(r.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { totalAmount: 0, requestCount: 0, approvedCount: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.totalAmount += r.amount;
      monthData.requestCount += 1;
      if (r.status === 'approved') {
        monthData.approvedCount += 1;
      }
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        return {
          month: monthName,
          totalAmount: data.totalAmount,
          requestCount: data.requestCount,
          approvalRate: data.requestCount > 0 ? Math.round((data.approvedCount / data.requestCount) * 100) : 0
        };
      });

    // Generate department breakdown
    const departmentMap = new Map<string, { totalAmount: number; requestCount: number }>();
    
    reimbursements.forEach(r => {
      const department = r.profiles?.department || 'Unknown';
      
      if (!departmentMap.has(department)) {
        departmentMap.set(department, { totalAmount: 0, requestCount: 0 });
      }
      
      const deptData = departmentMap.get(department)!;
      deptData.totalAmount += r.amount;
      deptData.requestCount += 1;
    });

    const departmentData = Array.from(departmentMap.entries())
      .map(([department, data]) => ({
        department,
        totalAmount: data.totalAmount,
        requestCount: data.requestCount,
        averageAmount: data.requestCount > 0 ? Math.round(data.totalAmount / data.requestCount) : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Generate category breakdown
    const categoryMap = new Map<string, { totalAmount: number; requestCount: number }>();
    
    reimbursements.forEach(r => {
      const category = r.category || 'Other';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { totalAmount: 0, requestCount: 0 });
      }
      
      const catData = categoryMap.get(category)!;
      catData.totalAmount += r.amount;
      catData.requestCount += 1;
    });

    const categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalAmount: data.totalAmount,
        requestCount: data.requestCount,
        percentage: totalSpending > 0 ? Math.round((data.totalAmount / totalSpending) * 100) : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5); // Top 5 categories

    const reportData = {
      summary: {
        totalSpending,
        totalRequests,
        overallApprovalRate,
        averageProcessingTime
      },
      monthlyData,
      departmentData,
      categoryData
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 