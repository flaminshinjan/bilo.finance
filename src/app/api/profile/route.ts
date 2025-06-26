import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function getAuthenticatedUser(request?: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get the Supabase session cookies - these are the actual cookie names Supabase uses
    const accessTokenCookie = cookieStore.get('sb-localhost-auth-token')?.value || 
                              cookieStore.get('sb-127.0.0.1-auth-token')?.value ||
                              cookieStore.get('sb-' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname + '-auth-token')?.value;
    
    if (!accessTokenCookie) {
      return null;
    }

    // Parse the session from the cookie
    let session;
    try {
      session = JSON.parse(accessTokenCookie);
    } catch (e) {
      console.error('Failed to parse session cookie:', e);
      return null;
    }

    if (!session.access_token) {
      return null;
    }

    // Create supabase client and verify the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the user with the access token
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    
    if (error || !user) {
      console.error('Error verifying user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameter (sent by client)
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Create service client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, return default profile data
        const defaultProfile = {
          id: userId,
          email: '',
          full_name: '',
          phone: '',
          department: '',
          company_id: null
        };

        return NextResponse.json(defaultProfile);
      }

      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in profile GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, email, full_name, phone, department, company_id } = body;

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      );
    }

    // Use the provided ID
    const userId = id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create service client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to update first (in case profile exists)
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    let updatedProfile;

    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create new one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email,
          full_name,
          phone: phone || '',
          department: department || '',
          company_id: company_id || null
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      updatedProfile = newProfile;
    } else if (existingProfile) {
      // Profile exists, update it
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          full_name,
          phone: phone || '',
          department: department || '',
          company_id: company_id || null
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      updatedProfile = updated;
    } else {
      console.error('Unexpected error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to process profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in profile PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 