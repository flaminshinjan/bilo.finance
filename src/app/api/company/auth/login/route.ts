import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find company by email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, company.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('companies')
      .update({ last_login: new Date().toISOString() })
      .eq('id', company.id);

    // Return success response (without password hash)
    const { password_hash, ...safeCompanyData } = company;

    return NextResponse.json({
      message: 'Login successful',
      company: safeCompanyData
    }, { status: 200 });

  } catch (error) {
    console.error('Company login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 