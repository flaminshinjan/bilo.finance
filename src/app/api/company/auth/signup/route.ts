import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { companyName, email, password, contactName, phone } = await request.json();

    // Validate required fields
    if (!companyName || !email || !password || !contactName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', email)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_name: companyName,
        email,
        password_hash: hashedPassword,
        contact_name: contactName,
        phone,
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company account' },
        { status: 500 }
      );
    }

    // Return success response (without password hash)
    const { password_hash, ...safeCompanyData } = company;

    return NextResponse.json({
      message: 'Company account created successfully',
      company: safeCompanyData
    }, { status: 201 });

  } catch (error) {
    console.error('Company signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 