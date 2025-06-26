import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get reimbursements for employees of this company
    const { data: reimbursements, error: reimbursementsError } = await supabase
      .from('reimbursements')
      .select(`
        *,
        profiles!reimbursements_user_id_fkey!inner(full_name, email, department, phone, company_id)
      `)
      .eq('profiles.company_id', companyId)
      .order('created_at', { ascending: false });

    if (reimbursementsError) {
      console.error('Error fetching reimbursements:', reimbursementsError);
      return NextResponse.json(
        { error: 'Failed to fetch reimbursements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      reimbursements: reimbursements || []
    });

  } catch (error) {
    console.error('Company reimbursements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, notes } = body;

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database update
    // This would update the reimbursement status in your Supabase database
    console.log(`${action}ing reimbursement ${id} with notes:`, notes);

    const updatedReimbursement = {
      id,
      status: action === 'approve' ? 'approved' : 'rejected',
      processedAt: new Date().toISOString(),
      notes: notes || ''
    };

    return NextResponse.json({ 
      success: true, 
      reimbursement: updatedReimbursement 
    });
  } catch (error) {
    console.error('Reimbursement update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update reimbursement' },
      { status: 500 }
    );
  }
} 