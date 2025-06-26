import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const { reimbursementId, action, notes } = body;

    if (!reimbursementId || !action) {
      return NextResponse.json(
        { error: 'Reimbursement ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    const { data: updatedReimbursement, error } = await supabase
      .from('reimbursements')
      .update({
        status,
        approved_at: now,
        admin_notes: notes || null
      })
      .eq('id', reimbursementId)
      .select(`
        *,
        profiles!reimbursements_user_id_fkey!inner (
          full_name,
          email,
          department,
          phone
        )
      `)
      .single();

    if (error) {
      console.error('Error updating reimbursement:', error);
      return NextResponse.json(
        { error: 'Failed to update reimbursement' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReimbursement);
  } catch (error) {
    console.error('Error in reimbursement action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 