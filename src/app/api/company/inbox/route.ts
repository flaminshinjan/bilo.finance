import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    // Get email logs from database
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // If companyId is provided, filter by company
    if (companyId) {
      query = query.or(`to.ilike.%@${companyId}%,related_id.eq.${companyId}`);
    }

    const { data: emailLogs, error } = await query;

    if (error) {
      console.error('Error fetching email logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email logs' },
        { status: 500 }
      );
    }

    // Transform the data to match the frontend interface
    const emails = (emailLogs || []).map(log => ({
      id: log.id,
      to: Array.isArray(log.to_emails) ? log.to_emails : [log.to_emails],
      from: log.from_email,
      subject: log.subject,
      status: log.status || 'sent',
      created_at: log.created_at,
      resend_id: log.resend_id,
      html: log.html_content,
      text: log.text_content,
      error: log.error_message,
      event_type: log.event_type,
      related_id: log.related_id
    }));

    return NextResponse.json({
      emails,
      total: emails.length,
      hasMore: emails.length === limit
    });

  } catch (error) {
    console.error('Error in inbox API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, emailId } = await request.json();

    if (action === 'sync_with_resend' && emailId) {
      // Sync specific email with Resend to get latest status
      const supabase = createServiceClient();
      
      const { data: emailLog, error: fetchError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('id', emailId)
        .single();

      if (fetchError || !emailLog?.resend_id) {
        return NextResponse.json(
          { error: 'Email not found or no Resend ID' },
          { status: 404 }
        );
      }

      // Fetch email details from Resend
      try {
        const resendResponse = await fetch(`https://api.resend.com/emails/${emailLog.resend_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (resendResponse.ok) {
          const resendData = await resendResponse.json();
          
          // Update email log with latest status from Resend
          const { error: updateError } = await supabase
            .from('email_logs')
            .update({
              status: resendData.last_event || emailLog.status,
              html_content: resendData.html || emailLog.html_content,
              text_content: resendData.text || emailLog.text_content,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailId);

          if (updateError) {
            console.error('Error updating email log:', updateError);
          }

          return NextResponse.json({
            success: true,
            email: {
              ...emailLog,
              status: resendData.last_event || emailLog.status,
              html_content: resendData.html || emailLog.html_content,
              text_content: resendData.text || emailLog.text_content
            }
          });
        } else {
          console.error('Resend API error:', resendResponse.status);
          return NextResponse.json(
            { error: 'Failed to sync with Resend' },
            { status: 400 }
          );
        }
      } catch (resendError) {
        console.error('Error calling Resend API:', resendError);
        return NextResponse.json(
          { error: 'Failed to connect to Resend' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in inbox POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 