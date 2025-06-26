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

    // Get company information
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return NextResponse.json(
        { error: 'Failed to fetch company' },
        { status: 500 }
      );
    }

    // Transform company data to match frontend interface
    const companyInfo = {
      name: company.company_name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      website: company.website || '',
      description: company.description || ''
    };

    // Default reimbursement settings (these could be stored in a separate settings table)
    const reimbursementSettings = {
      maxAmount: 5000,
      requireReceipts: true,
      autoApproveUnder: 100,
      approvalWorkflow: 'manager_only',
      categories: ['Travel', 'Meals', 'Office Supplies', 'Training', 'Equipment']
    };

    // Default notification settings
    const notifications = {
      emailNotifications: true,
      newRequestAlerts: true,
      approvalReminders: true,
      monthlyReports: true,
      expenseAlerts: true
    };

    return NextResponse.json({
      companyInfo,
      reimbursementSettings,
      notifications
    });

  } catch (error) {
    console.error('Company settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const body = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const { companyInfo, reimbursementSettings, notifications } = body;

    // Update company information
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        company_name: companyInfo.name,
        email: companyInfo.email,
        phone: companyInfo.phone,
        address: companyInfo.address,
        website: companyInfo.website,
        description: companyInfo.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company:', updateError);
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      );
    }

    // TODO: In the future, we could store reimbursement settings and notifications in separate tables
    // For now, we'll just return success since the main company info has been updated

    return NextResponse.json({
      success: true,
      company: updatedCompany
    });

  } catch (error) {
    console.error('Company settings update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 