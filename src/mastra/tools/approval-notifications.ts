import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabase } from '@/utils/supabase';
import { notifyApprovalRequired } from '@/utils/email-service';
import { getInvoiceWithDetails, getCompanyApprovers } from '@/utils/email-helpers';

// Tool to create approval workflow and send notifications
export const createApprovalWorkflowWithNotifications = new Tool({
  id: 'create-approval-workflow-with-notifications',
  description: 'Create an approval workflow and send notification emails to approvers',
  inputSchema: z.object({
    invoiceId: z.string(),
    workflowType: z.enum(['auto_approve', 'single_approval', 'multi_approval']),
    approvers: z.array(z.object({
      userId: z.string(),
      role: z.string(),
      order: z.number(),
      deadline: z.string().optional(),
    })),
    createdBy: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    workflowId: z.string(),
    message: z.string(),
    notificationsSent: z.number(),
  }),
  execute: async ({ context: { invoiceId, workflowType, approvers, createdBy } }) => {
    try {
      console.log(`🔄 Creating approval workflow with notifications for invoice ${invoiceId}...`);

      // Get invoice details for notifications
      const invoiceDetails = await getInvoiceWithDetails(invoiceId);
      if (!invoiceDetails) {
        throw new Error(`Invoice not found: ${invoiceId}`);
      }

      // Create workflow in database
      const workflowData = {
        invoice_id: invoiceId,
        workflow_type: workflowType,
        status: 'pending',
        current_step: 1,
        total_steps: approvers.length,
        steps: approvers,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      };

      const { data: workflow, error } = await supabase
        .from('approval_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Approval workflow created with ID: ${workflow.id}`);

      // Send notifications to approvers if not auto-approved
      let notificationsSent = 0;
      if (workflowType !== 'auto_approve' && invoiceDetails.profiles && invoiceDetails.profiles.companies) {
        // For now, send to the first approver (current step)
        const currentApprover = approvers.find(a => a.order === 1);
        
        if (currentApprover) {
          // Get approver details
          const { data: approverProfile, error: approverError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', currentApprover.userId)
            .single();

          if (!approverError && approverProfile) {
            try {
              await notifyApprovalRequired({
                companyName: invoiceDetails.profiles.companies.company_name,
                approverName: approverProfile.full_name,
                approverEmail: approverProfile.email,
                invoiceNumber: invoiceDetails.invoice_number,
                vendorName: invoiceDetails.vendor_name,
                amount: invoiceDetails.amount,
                currency: invoiceDetails.currency || 'USD',
                employeeName: invoiceDetails.profiles.full_name,
                workflowId: workflow.id,
                dueDate: invoiceDetails.due_date,
              });
              notificationsSent++;
              console.log(`📧 Approval notification sent to ${approverProfile.email}`);
            } catch (emailError) {
              console.error('❌ Failed to send approval notification:', emailError);
            }
          }
        }
      }

      return {
        success: true,
        workflowId: workflow.id,
        message: 'Approval workflow created successfully',
        notificationsSent,
      };
    } catch (error) {
      console.error('❌ Failed to create approval workflow with notifications:', error);
      return {
        success: false,
        workflowId: '',
        message: `Failed to create approval workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        notificationsSent: 0,
      };
    }
  },
});

// Tool to process approval decisions and send notifications
export const processApprovalWithNotifications = new Tool({
  id: 'process-approval-with-notifications',
  description: 'Process approval decision and send appropriate notifications',
  inputSchema: z.object({
    workflowId: z.string(),
    decision: z.enum(['approve', 'reject', 'escalate']),
    approverId: z.string(),
    stepNumber: z.number(),
    comments: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    completed: z.boolean(),
    nextApprover: z.string().optional(),
    notificationsSent: z.number(),
    message: z.string(),
  }),
  execute: async ({ context: { workflowId, decision, approverId, stepNumber, comments } }) => {
    try {
      console.log(`🎯 Processing approval decision: ${decision} for workflow ${workflowId}`);

      // Get workflow details
      const { data: workflow, error: workflowError } = await supabase
        .from('approval_workflows')
        .select(`
          *,
          invoices!approval_workflows_invoice_id_fkey(
            *,
            profiles!invoices_user_id_fkey(
              *,
              companies!profiles_company_id_fkey(*)
            )
          )
        `)
        .eq('id', workflowId)
        .single();

      if (workflowError || !workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Record the approval decision
      const { error: decisionError } = await supabase
        .from('approval_decisions')
        .insert({
          workflow_id: workflowId,
          step_number: stepNumber,
          approver_id: approverId,
          decision,
          comments,
          decided_at: new Date().toISOString(),
        });

      if (decisionError) {
        throw decisionError;
      }

      let workflowCompleted = false;
      let nextApprover: string | undefined;
      let notificationsSent = 0;

      if (decision === 'approve') {
        // Check if this is the last step
        if (stepNumber >= workflow.total_steps) {
          // Workflow completed - approve the invoice
          workflowCompleted = true;
          
          await supabase
            .from('approval_workflows')
            .update({
              status: 'approved',
              completed_at: new Date().toISOString(),
            })
            .eq('id', workflowId);

          await supabase
            .from('invoices')
            .update({
              status: 'approved',
              approval_status: 'approved',
              updated_at: new Date().toISOString(),
            })
            .eq('id', workflow.invoice_id);

          console.log(`✅ Invoice ${workflow.invoice_id} approved through workflow ${workflowId}`);
        } else {
          // Move to next step
          const nextStep = stepNumber + 1;
          const nextApproverData = (workflow.steps as any[]).find(s => s.order === nextStep);
          
          if (nextApproverData) {
            nextApprover = nextApproverData.userId;
            
            await supabase
              .from('approval_workflows')
              .update({
                current_step: nextStep,
                status: 'in_progress',
              })
              .eq('id', workflowId);

            // Send notification to next approver
            const { data: approverProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', nextApprover)
              .single();

            if (approverProfile && workflow.invoices?.profiles?.companies) {
              try {
                await notifyApprovalRequired({
                  companyName: workflow.invoices.profiles.companies.company_name,
                  approverName: approverProfile.full_name,
                  approverEmail: approverProfile.email,
                  invoiceNumber: workflow.invoices.invoice_number,
                  vendorName: workflow.invoices.vendor_name,
                  amount: workflow.invoices.amount,
                  currency: workflow.invoices.currency || 'USD',
                  employeeName: workflow.invoices.profiles.full_name,
                  workflowId: workflow.id,
                  dueDate: workflow.invoices.due_date,
                });
                notificationsSent++;
                console.log(`📧 Approval notification sent to next approver: ${approverProfile.email}`);
              } catch (emailError) {
                console.error('❌ Failed to send approval notification:', emailError);
              }
            }
          }
        }
      } else if (decision === 'reject') {
        // Workflow rejected
        workflowCompleted = true;
        
        await supabase
          .from('approval_workflows')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString(),
          })
          .eq('id', workflowId);

        await supabase
          .from('invoices')
          .update({
            status: 'rejected',
            approval_status: 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflow.invoice_id);

        console.log(`❌ Invoice ${workflow.invoice_id} rejected through workflow ${workflowId}`);
      }

      return {
        success: true,
        completed: workflowCompleted,
        nextApprover,
        notificationsSent,
        message: `Approval decision processed: ${decision}`,
      };
    } catch (error) {
      console.error('❌ Failed to process approval with notifications:', error);
      return {
        success: false,
        completed: false,
        notificationsSent: 0,
        message: `Failed to process approval: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
}); 