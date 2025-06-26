import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get company ID from query
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get employees for this company
    const { data: employees, error: employeesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Get reimbursement statistics for each employee
    const employeesWithStats = await Promise.all(
      (employees || []).map(async (employee) => {
        const { data: reimbursements } = await supabase
          .from('reimbursements')
          .select('id, amount, status, created_at')
          .eq('user_id', employee.id);

        const totalReimbursements = reimbursements?.length || 0;
        const totalAmount = reimbursements?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
        const pendingCount = reimbursements?.filter(r => r.status === 'pending').length || 0;
        const approvedCount = reimbursements?.filter(r => r.status === 'approved').length || 0;
        const rejectedCount = reimbursements?.filter(r => r.status === 'rejected').length || 0;

        // Get last activity
        const lastReimbursement = reimbursements?.[0];
        const lastActivity = lastReimbursement 
          ? new Date(lastReimbursement.created_at).toISOString()
          : employee.created_at;

        return {
          id: employee.id,
          name: employee.full_name || 'Unknown',
          email: employee.email || '',
          department: employee.department || 'General',
          joinDate: employee.created_at,
          lastActivity,
          statistics: {
            totalReimbursements,
            totalAmount,
            pendingCount,
            approvedCount,
            rejectedCount
          },
          contact: {
            phone: employee.phone || '',
            email: employee.email || ''
          }
        };
      })
    );

    return NextResponse.json({
      employees: employeesWithStats,
      totalCount: employeesWithStats.length
    });

  } catch (error) {
    console.error('Employees API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 