import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { notifyReimbursementStatusUpdate } from '@/utils/email-service';
import { getReimbursementWithDetails } from '@/utils/email-helpers';

export async function PUT(request: NextRequest) {
  try {
    const { reimbursementId, action, comments, approvedBy } = await request.json();
    console.log('📋 Reimbursement action request:', { reimbursementId, action, comments, approvedBy });

    if (!reimbursementId || !action || !approvedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: reimbursementId, action, approvedBy' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Get reimbursement details before updating
    const reimbursementDetails = await getReimbursementWithDetails(reimbursementId);
    if (!reimbursementDetails) {
      return NextResponse.json(
        { error: 'Reimbursement not found' },
        { status: 404 }
      );
    }

    // Get approver details - try to find a profile, fallback to company info
    let approver = { full_name: 'Company Admin', email: '' };
    
    const { data: profileApprover, error: approverError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', approvedBy)
      .single();

    if (profileApprover) {
      approver = profileApprover;
    } else {
      // If no profile found, try to get company info
      const { data: companyApprover } = await supabase
        .from('companies')
        .select('company_name, email')
        .eq('id', approvedBy)
        .single();
      
      if (companyApprover) {
        approver = {
          full_name: `${companyApprover.company_name} Admin`,
          email: companyApprover.email
        };
      }
    }

    // Update reimbursement status
    const updateData: any = {
      status: action,
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    };

    // Only set approved_by if it's a valid profile ID (not a company ID)
    if (profileApprover) {
      updateData.approved_by = approvedBy;
    }

    if (comments) {
      updateData.admin_notes = comments;
    }

    const { data: updatedReimbursement, error } = await supabase
      .from('reimbursements')
      .update(updateData)
      .eq('id', reimbursementId)
      .select(`
        *,
        profiles!reimbursements_user_id_fkey(
          id,
          email,
          full_name,
          company_id,
          companies!profiles_company_id_fkey(
            id,
            company_name,
            email
          )
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update reimbursement' },
        { status: 500 }
      );
    }

    // Send email notifications
    try {
      if (updatedReimbursement.profiles && updatedReimbursement.profiles.companies) {
        const emailData = {
          companyName: updatedReimbursement.profiles.companies.company_name,
          companyEmail: updatedReimbursement.profiles.companies.email,
          employeeName: updatedReimbursement.profiles.full_name,
          employeeEmail: updatedReimbursement.profiles.email,
          reimbursementId: updatedReimbursement.id,
          amount: updatedReimbursement.amount,
          currency: 'USD', // Default currency
          status: action as 'approved' | 'rejected',
          approverName: approver.full_name,
          comments: comments,
          processedDate: new Date().toISOString(),
        };
        
        console.log('📧 Sending emails to:', {
          companyEmail: emailData.companyEmail,
          employeeEmail: emailData.employeeEmail,
          employeeName: emailData.employeeName
        });
        
        await notifyReimbursementStatusUpdate(emailData);
        console.log('📧 Reimbursement status update notifications sent successfully');
      } else {
        console.warn('⚠️ Could not send email notifications - user or company data not found');
        console.log('Debug - updatedReimbursement.profiles:', updatedReimbursement.profiles);
      }
    } catch (emailError) {
      console.error('❌ Failed to send email notifications:', emailError);
      // Don't fail the API if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Reimbursement ${action} successfully`,
      reimbursement: {
        id: updatedReimbursement.id,
        status: updatedReimbursement.status,
        amount: updatedReimbursement.amount,
        employee_name: updatedReimbursement.profiles?.full_name || 'Unknown',
        email: updatedReimbursement.profiles?.email || '',
        approved_by: approver.full_name,
        approved_at: updatedReimbursement.approved_at,
        comments: updatedReimbursement.admin_notes,
      },
    });

  } catch (error) {
    console.error('Error processing reimbursement action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 