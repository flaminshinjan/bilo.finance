import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Loading...');
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) {
      throw error;
    }
    

    
    return NextResponse.json({
      success: true,
      invoices: invoices || [],
      count: invoices?.length || 0,
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch invoices:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        invoices: [],
        count: 0,
      },
      { status: 500 }
    );
  }
} 