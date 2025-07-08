import { Resend } from 'resend';
import { createServiceClient } from '@/utils/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface InvoiceProcessedData {
  companyName: string;
  companyEmail: string;
  employeeName: string;
  employeeEmail: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: string;
  processingDate: string;
}

export interface ReimbursementSubmittedData {
  companyName: string;
  companyEmail: string;
  employeeName: string;
  employeeEmail: string;
  reimbursementId: string;
  amount: number;
  currency: string;
  businessPurpose: string;
  submittedDate: string;
}

export interface ReimbursementStatusData {
  companyName: string;
  companyEmail: string;
  employeeName: string;
  employeeEmail: string;
  reimbursementId: string;
  amount: number;
  currency: string;
  status: 'approved' | 'rejected';
  approverName?: string;
  comments?: string;
  processedDate: string;
}

export interface ApprovalRequestData {
  companyName: string;
  approverName: string;
  approverEmail: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: string;
  employeeName: string;
  workflowId: string;
  dueDate?: string;
}

// Email templates
export const emailTemplates = {
  invoiceProcessed: (data: InvoiceProcessedData) => ({
    subject: `Invoice Processed: ${data.invoiceNumber} - ${data.vendorName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice Processed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Invoice Processed Successfully</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #495057; margin-top: 0;">Dear ${data.companyName} Team,</h2>
            
            <p>An invoice has been successfully processed in your Bilo Finance system:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #28a745;">Invoice Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.invoiceNumber}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Vendor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.vendorName}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.currency}${data.amount.toFixed(2)}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Processed By:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.employeeName}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Processing Date:</strong></td><td style="padding: 8px 0;">${new Date(data.processingDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            
            <p style="margin-bottom: 25px;">The invoice has been extracted and is now ready for the approval workflow. You can review and manage this invoice in your dashboard.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Dashboard</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
              <p>This is an automated notification from Bilo Finance. If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Invoice Processed Successfully

Dear ${data.companyName} Team,

An invoice has been successfully processed in your Bilo Finance system:

Invoice Details:
- Invoice Number: ${data.invoiceNumber}
- Vendor: ${data.vendorName}
- Amount: ${data.currency}${data.amount.toFixed(2)}
- Processed By: ${data.employeeName}
- Processing Date: ${new Date(data.processingDate).toLocaleDateString()}

The invoice has been extracted and is now ready for the approval workflow. You can review and manage this invoice in your dashboard.

View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard

This is an automated notification from Bilo Finance.`
  }),

  reimbursementSubmitted: (data: ReimbursementSubmittedData) => ({
    subject: `New Reimbursement Request: ${data.currency}${data.amount.toFixed(2)} - ${data.employeeName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reimbursement Request Submitted</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Reimbursement Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #495057; margin-top: 0;">Dear ${data.companyName} Team,</h2>
            
            <p>A new reimbursement request has been submitted for your review:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <h3 style="margin-top: 0; color: #ff6b6b;">Reimbursement Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Request ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.reimbursementId}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Employee:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.employeeName}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.currency}${data.amount.toFixed(2)}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Business Purpose:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.businessPurpose}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Submitted Date:</strong></td><td style="padding: 8px 0;">${new Date(data.submittedDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            
            <p style="margin-bottom: 25px;">Please review this reimbursement request and take appropriate action. The employee will be notified once the request is processed.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard/reimbursements" style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Review Request</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
              <p>This is an automated notification from Bilo Finance. If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New Reimbursement Request

Dear ${data.companyName} Team,

A new reimbursement request has been submitted for your review:

Request Details:
- Request ID: ${data.reimbursementId}
- Employee: ${data.employeeName}
- Amount: ${data.currency}${data.amount.toFixed(2)}
- Business Purpose: ${data.businessPurpose}
- Submitted Date: ${new Date(data.submittedDate).toLocaleDateString()}

Please review this reimbursement request and take appropriate action.

Review Request: ${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard/reimbursements

This is an automated notification from Bilo Finance.`
  }),

  reimbursementStatusUpdate: (data: ReimbursementStatusData) => ({
    subject: `Reimbursement ${data.status === 'approved' ? 'Approved' : 'Rejected'}: ${data.currency}${data.amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reimbursement Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${data.status === 'approved' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reimbursement ${data.status === 'approved' ? 'Approved' : 'Rejected'}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #495057; margin-top: 0;">Dear ${data.employeeName},</h2>
            
            <p>Your reimbursement request has been <strong style="color: ${data.status === 'approved' ? '#28a745' : '#dc3545'};">${data.status}</strong>:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${data.status === 'approved' ? '#28a745' : '#dc3545'};">
              <h3 style="margin-top: 0; color: ${data.status === 'approved' ? '#28a745' : '#dc3545'};">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Request ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.reimbursementId}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.currency}${data.amount.toFixed(2)}</td></tr>
                ${data.approverName ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Processed By:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.approverName}</td></tr>` : ''}
                <tr><td style="padding: 8px 0;"><strong>Processed Date:</strong></td><td style="padding: 8px 0;">${new Date(data.processedDate).toLocaleDateString()}</td></tr>
              </table>
            </div>
            
            ${data.comments ? `
              <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #495057;">Comments:</h4>
                <p style="margin-bottom: 0; font-style: italic;">${data.comments}</p>
              </div>
            ` : ''}
            
            <p style="margin-bottom: 25px;">
              ${data.status === 'approved' 
                ? 'Your reimbursement has been approved and will be processed according to company payment schedules.' 
                : 'If you have questions about this decision, please contact your manager or HR department.'}
            </p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reimbursements" style="background: ${data.status === 'approved' ? '#28a745' : '#dc3545'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Details</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
              <p>This is an automated notification from Bilo Finance. If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reimbursement ${data.status === 'approved' ? 'Approved' : 'Rejected'}

Dear ${data.employeeName},

Your reimbursement request has been ${data.status}:

Request Details:
- Request ID: ${data.reimbursementId}
- Amount: ${data.currency}${data.amount.toFixed(2)}
${data.approverName ? `- Processed By: ${data.approverName}` : ''}
- Processed Date: ${new Date(data.processedDate).toLocaleDateString()}

${data.comments ? `Comments: ${data.comments}` : ''}

${data.status === 'approved' 
  ? 'Your reimbursement has been approved and will be processed according to company payment schedules.' 
  : 'If you have questions about this decision, please contact your manager or HR department.'}

View Details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reimbursements

This is an automated notification from Bilo Finance.`
  }),

  approvalRequest: (data: ApprovalRequestData) => ({
    subject: `Approval Required: Invoice ${data.invoiceNumber} - ${data.currency}${data.amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Approval Required</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #2d3436; margin: 0; font-size: 28px;">⚠️ Approval Required</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #495057; margin-top: 0;">Dear ${data.approverName},</h2>
            
            <p>An invoice requires your approval in the Bilo Finance system:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12;">
              <h3 style="margin-top: 0; color: #f39c12;">Invoice Requiring Approval</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.invoiceNumber}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Vendor:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.vendorName}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.currency}${data.amount.toFixed(2)}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Submitted By:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.employeeName}</td></tr>
                ${data.dueDate ? `<tr><td style="padding: 8px 0;"><strong>Due Date:</strong></td><td style="padding: 8px 0;">${new Date(data.dueDate).toLocaleDateString()}</td></tr>` : ''}
              </table>
            </div>
            
            <p style="margin-bottom: 25px;">Please review this invoice and approve or reject it according to your company's approval policies. Timely processing helps maintain vendor relationships.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard?workflow=${data.workflowId}" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 0 10px;">Approve</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard?workflow=${data.workflowId}" style="background: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 0 10px;">Review</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
              <p>This is an automated notification from Bilo Finance. If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Approval Required: Invoice ${data.invoiceNumber}

Dear ${data.approverName},

An invoice requires your approval in the Bilo Finance system:

Invoice Details:
- Invoice Number: ${data.invoiceNumber}
- Vendor: ${data.vendorName}
- Amount: ${data.currency}${data.amount.toFixed(2)}
- Submitted By: ${data.employeeName}
${data.dueDate ? `- Due Date: ${new Date(data.dueDate).toLocaleDateString()}` : ''}

Please review this invoice and approve or reject it according to your company's approval policies.

Review Invoice: ${process.env.NEXT_PUBLIC_APP_URL}/company/dashboard?workflow=${data.workflowId}

This is an automated notification from Bilo Finance.`
  })
};

// Add this function to log emails to database
async function logEmailToDatabase(emailData: {
  to: string[];
  from: string;
  subject: string;
  html: string;
  text: string;
  resend_id?: string;
  event_type: string;
  related_id?: string;
  status?: string;
  error?: string;
}) {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('email_logs')
      .insert({
        to_emails: emailData.to,
        from_email: emailData.from,
        subject: emailData.subject,
        html_content: emailData.html,
        text_content: emailData.text,
        resend_id: emailData.resend_id,
        event_type: emailData.event_type,
        related_id: emailData.related_id,
        status: emailData.status || 'sent',
        error_message: emailData.error,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log email to database:', error);
    }
  } catch (error) {
    console.error('Error logging email to database:', error);
  }
}

// Update the sendEmail function
async function sendEmail(emailData: EmailData): Promise<string | undefined> {
  if (!resend) {
    console.log('📧 Development mode - Email would be sent:', emailData);
    
    // Log to database even in development mode
    await logEmailToDatabase({
      to: emailData.to,
      from: emailData.from || process.env.FROM_EMAIL || 'noreply@bilo.finance',
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      event_type: 'development',
      status: 'development'
    });
    
    return 'dev-mode-id';
  }

  try {
    const result = await resend.emails.send({
      from: emailData.from || process.env.FROM_EMAIL || 'noreply@bilo.finance',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    if (result.data?.id) {
      console.log(`✅ Email sent successfully: ${result.data.id}`);
      
      // Log successful email to database
      await logEmailToDatabase({
        to: emailData.to,
        from: emailData.from || process.env.FROM_EMAIL || 'noreply@bilo.finance',
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        resend_id: result.data.id,
        event_type: 'sent',
        status: 'sent'
      });
      
      return result.data.id;
    } else if (result.error) {
      console.error('❌ Email sending failed:', result.error);
      
      // Log failed email to database
      await logEmailToDatabase({
        to: emailData.to,
        from: emailData.from || process.env.FROM_EMAIL || 'noreply@bilo.finance',
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        event_type: 'failed',
        status: 'failed',
        error: result.error.message
      });
      
      return undefined;
    }
  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Log error to database
    await logEmailToDatabase({
      to: emailData.to,
      from: emailData.from || process.env.FROM_EMAIL || 'noreply@bilo.finance',
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      event_type: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return undefined;
  }
}

// Update notification functions to include event types and related IDs
export async function notifyInvoiceProcessed(data: InvoiceProcessedData): Promise<void> {
  const template = emailTemplates.invoiceProcessed(data);
  
  // Send to both company and employee
  await Promise.all([
    (async () => {
      const companyEmailId = await sendEmail({
        to: [data.companyEmail],
        subject: `✅ New Invoice Processed - ${data.employeeName}`,
        html: template.html.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your invoice has been processed', `${data.employeeName}'s invoice has been processed`),
        text: template.text.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your invoice has been processed', `${data.employeeName}'s invoice has been processed`),
      });
      
      if (companyEmailId) {
        await logEmailToDatabase({
          to: [data.companyEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: `✅ New Invoice Processed - ${data.employeeName}`,
          html: template.html,
          text: template.text,
          resend_id: companyEmailId,
          event_type: 'invoice_processed',
          related_id: data.invoiceId,
          status: 'sent'
        });
      }
    })(),
    (async () => {
      const employeeEmailId = await sendEmail({
        to: [data.employeeEmail],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      if (employeeEmailId) {
        await logEmailToDatabase({
          to: [data.employeeEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: template.subject,
          html: template.html,
          text: template.text,
          resend_id: employeeEmailId,
          event_type: 'invoice_processed',
          related_id: data.invoiceId,
          status: 'sent'
        });
      }
    })()
  ]);
}

export async function notifyReimbursementSubmitted(data: ReimbursementSubmittedData): Promise<void> {
  const template = emailTemplates.reimbursementSubmitted(data);
  
  console.log(`📧 Sending reimbursement submission notifications for ${data.reimbursementId}`);
  console.log(`📧 Company email: ${data.companyEmail}`);
  console.log(`📧 Employee email: ${data.employeeEmail}`);
  
  // Send to both company and employee
  await Promise.all([
    (async () => {
      const companyEmailId = await sendEmail({
        to: [data.companyEmail],
        subject: `🔔 New Reimbursement Request - ${data.employeeName}`,
        html: template.html.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your reimbursement request has been submitted', `${data.employeeName} has submitted a reimbursement request that requires review`),
        text: template.text.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your reimbursement request has been submitted', `${data.employeeName} has submitted a reimbursement request that requires review`),
      });
      
      if (companyEmailId) {
        await logEmailToDatabase({
          to: [data.companyEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: `🔔 New Reimbursement Request - ${data.employeeName}`,
          html: template.html,
          text: template.text,
          resend_id: companyEmailId,
          event_type: 'reimbursement_submitted',
          related_id: data.reimbursementId,
          status: 'sent'
        });
      }
    })(),
    (async () => {
      const employeeEmailId = await sendEmail({
        to: [data.employeeEmail],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      if (employeeEmailId) {
        await logEmailToDatabase({
          to: [data.employeeEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: template.subject,
          html: template.html,
          text: template.text,
          resend_id: employeeEmailId,
          event_type: 'reimbursement_submitted',
          related_id: data.reimbursementId,
          status: 'sent'
        });
      }
    })()
  ]);
  
  console.log(`📧 Reimbursement submitted notifications sent for ${data.reimbursementId}`);
}

export async function notifyReimbursementStatusUpdate(data: ReimbursementStatusData): Promise<void> {
  const template = emailTemplates.reimbursementStatusUpdate(data);
  
  console.log(`📧 Sending reimbursement status update notifications for ${data.reimbursementId}`);
  console.log(`📧 Company email: ${data.companyEmail}`);
  console.log(`📧 Employee email: ${data.employeeEmail}`);
  
  // Send to both company and employee
  await Promise.all([
    (async () => {
      const companyEmailId = await sendEmail({
        to: [data.companyEmail],
        subject: `✅ ${template.subject} - ${data.employeeName}`,
        html: template.html.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your reimbursement request has been', `${data.employeeName}'s reimbursement request has been`),
        text: template.text.replace(`Dear ${data.employeeName},`, `Dear ${data.companyName} Team,`)
          .replace('Your reimbursement request has been', `${data.employeeName}'s reimbursement request has been`),
      });
      
      if (companyEmailId) {
        await logEmailToDatabase({
          to: [data.companyEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: `✅ ${template.subject} - ${data.employeeName}`,
          html: template.html,
          text: template.text,
          resend_id: companyEmailId,
          event_type: 'reimbursement_status',
          related_id: data.reimbursementId,
          status: 'sent'
        });
      }
    })(),
    (async () => {
      const employeeEmailId = await sendEmail({
        to: [data.employeeEmail],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      
      if (employeeEmailId) {
        await logEmailToDatabase({
          to: [data.employeeEmail],
          from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
          subject: template.subject,
          html: template.html,
          text: template.text,
          resend_id: employeeEmailId,
          event_type: 'reimbursement_status',
          related_id: data.reimbursementId,
          status: 'sent'
        });
      }
    })()
  ]);
  
  console.log(`📧 Reimbursement status update notifications sent for ${data.reimbursementId}`);
}

export async function notifyApprovalRequired(data: ApprovalRequestData): Promise<void> {
  const template = emailTemplates.approvalRequest(data);
  
  const emailId = await sendEmail({
    to: [data.approverEmail],
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  if (emailId) {
    await logEmailToDatabase({
      to: [data.approverEmail],
      from: process.env.FROM_EMAIL || 'noreply@bilo.finance',
      subject: template.subject,
      html: template.html,
      text: template.text,
      resend_id: emailId,
      event_type: 'approval_required',
      related_id: data.requestId,
      status: 'sent'
    });
  }
} 