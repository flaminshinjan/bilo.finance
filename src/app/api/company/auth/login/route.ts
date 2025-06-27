import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';
import bcrypt from 'bcryptjs';
import { verifyPassword } from '@/utils/crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('Company login attempt started');
    
    const { email, password } = await request.json();
    console.log('Request parsed, email:', email ? 'provided' : 'missing');

    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Creating Supabase service client');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    console.log('Supabase client created successfully');

    // Find company by email
    console.log('Querying company by email');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (companyError) {
      console.error('Company query error:', companyError);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!company) {
      console.log('No company found for email');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Company found, verifying password');

    // Verify password with fallback mechanism
    let isValidPassword = false;
    try {
      // Try bcrypt first
      console.log('Attempting bcrypt verification');
      isValidPassword = await bcrypt.compare(password, company.password_hash);
      console.log('bcrypt verification completed successfully');
    } catch (bcryptError) {
      console.error('bcrypt error, trying Web Crypto API fallback:', bcryptError);
      try {
        // Fallback to Web Crypto API
        isValidPassword = await verifyPassword(password, company.password_hash);
        console.log('Web Crypto API verification completed');
      } catch (cryptoError) {
        console.error('Both bcrypt and Web Crypto API failed:', cryptoError);
        return NextResponse.json(
          { error: 'Authentication error' },
          { status: 500 }
        );
      }
    }

    if (!isValidPassword) {
      console.log('Invalid password provided');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Password valid, updating last login');

    // Update last login
    try {
      await supabase
        .from('companies')
        .update({ last_login: new Date().toISOString() })
        .eq('id', company.id);
      console.log('Last login updated successfully');
    } catch (updateError) {
      console.error('Failed to update last login:', updateError);
      // Don't fail the login for this
    }

    // Return success response (without password hash)
    const { password_hash, ...safeCompanyData } = company;

    console.log('Login successful for company:', company.id);
    return NextResponse.json({
      message: 'Login successful',
      company: safeCompanyData
    }, { status: 200 });

  } catch (error) {
    console.error('Company login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
} 