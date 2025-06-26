import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get all active companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, company_name, email, contact_name, phone')
      .eq('is_active', true)
      .order('company_name');

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error in companies API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 