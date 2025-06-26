import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { supabase } from '@/utils/supabase';

// Invoice schema for database operations
const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoice_number: z.string(),
  vendor_name: z.string(),
  vendor_address: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  invoice_date: z.string(),
  due_date: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).default('pending'),
  approval_status: z.enum(['pending_approval', 'approved', 'rejected', 'auto_approved']).default('pending_approval'),
  extracted_data: z.any(),
  validation_flags: z.array(z.any()).default([]),
  ai_confidence_score: z.number().optional(),
  extraction_method: z.string().optional(),
  original_file_path: z.string().optional(),
  created_by: z.string(),
  created_at: z.string().optional(),
});

// Tool to save invoice to database
export const saveInvoiceTool = new Tool({
  id: 'save-invoice',
  description: 'Save invoice data to Supabase database',
  inputSchema: InvoiceSchema,
  outputSchema: z.object({
    success: z.boolean(),
    invoiceId: z.string(),
    message: z.string(),
  }),
  execute: async (invoiceData) => {
    try {
      console.log('💾 Saving invoice to database...');
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Invoice saved with ID: ${data.id}`);
      
      return {
        success: true,
        invoiceId: data.id,
        message: 'Invoice saved successfully',
      };
    } catch (error) {
      console.error('❌ Failed to save invoice:', error);
      return {
        success: false,
        invoiceId: '',
        message: `Failed to save invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Tool to get due invoices for employees
export const getDueInvoicesTool = new Tool({
  id: 'get-due-invoices',
  description: 'Get invoices that are due for employees/users',
  inputSchema: z.object({
    userId: z.string().optional(),
    daysAhead: z.number().default(30),
    status: z.string().optional(),
  }),
  outputSchema: z.object({
    invoices: z.array(z.object({
      id: z.string(),
      invoice_number: z.string(),
      vendor_name: z.string(),
      amount: z.number(),
      due_date: z.string(),
      status: z.string(),
      days_until_due: z.number(),
    })),
    totalAmount: z.number(),
    count: z.number(),
  }),
  execute: async ({ context: { userId, daysAhead, status } }) => {
    try {
      console.log(`📋 Getting due invoices for next ${daysAhead} days...`);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      let query = supabase
        .from('invoices')
        .select('*')
        .not('due_date', 'is', null)
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (userId) {
        query = query.eq('created_by', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const invoices = (data || []).map(invoice => {
        const dueDate = new Date(invoice.due_date);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          vendor_name: invoice.vendor_name,
          amount: invoice.amount,
          due_date: invoice.due_date,
          status: invoice.status,
          days_until_due: daysDiff,
        };
      });

      const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

      console.log(`✅ Found ${invoices.length} due invoices totaling $${totalAmount.toLocaleString()}`);

      return {
        invoices,
        totalAmount,
        count: invoices.length,
      };
    } catch (error) {
      console.error('❌ Failed to get due invoices:', error);
      throw new Error(`Failed to get due invoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Tool to update invoice status
export const updateInvoiceStatusTool = new Tool({
  id: 'update-invoice-status',
  description: 'Update invoice status in the database',
  inputSchema: z.object({
    invoiceId: z.string(),
    status: z.enum(['pending', 'approved', 'rejected', 'paid']),
    approvalStatus: z.enum(['pending_approval', 'approved', 'rejected', 'auto_approved']).optional(),
    notes: z.string().optional(),
    updatedBy: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    updatedInvoice: z.any().optional(),
  }),
  execute: async ({ context: { invoiceId, status, approvalStatus, notes, updatedBy } }) => {
    try {
      console.log(`📝 Updating invoice ${invoiceId} status to ${status}...`);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      };

      if (approvalStatus) {
        updateData.approval_status = approvalStatus;
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Invoice ${invoiceId} status updated successfully`);

      return {
        success: true,
        message: 'Invoice status updated successfully',
        updatedInvoice: data,
      };
    } catch (error) {
      console.error('❌ Failed to update invoice status:', error);
      return {
        success: false,
        message: `Failed to update invoice status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Tool to create approval workflow
export const createApprovalWorkflowTool = new Tool({
  id: 'create-approval-workflow',
  description: 'Create an approval workflow for an invoice',
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
  }),
  execute: async ({ context: { invoiceId, workflowType, approvers, createdBy } }) => {
    try {
      console.log(`🔄 Creating approval workflow for invoice ${invoiceId}...`);

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

      const { data, error } = await supabase
        .from('approval_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Approval workflow created with ID: ${data.id}`);

      return {
        success: true,
        workflowId: data.id,
        message: 'Approval workflow created successfully',
      };
    } catch (error) {
      console.error('❌ Failed to create approval workflow:', error);
      return {
        success: false,
        workflowId: '',
        message: `Failed to create approval workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Tool to get pending approvals for a user
export const getPendingApprovalsTool = new Tool({
  id: 'get-pending-approvals',
  description: 'Get pending approvals for a specific user',
  inputSchema: z.object({
    userId: z.string(),
    limit: z.number().default(10),
  }),
  outputSchema: z.object({
    approvals: z.array(z.object({
      workflowId: z.string(),
      invoiceId: z.string(),
      invoice_number: z.string(),
      vendor_name: z.string(),
      amount: z.number(),
      currentStep: z.number(),
      deadline: z.string().optional(),
    })),
    count: z.number(),
  }),
  execute: async ({ context: { userId, limit } }) => {
    try {
      console.log(`📋 Getting pending approvals for user ${userId}...`);

      const { data, error } = await supabase
        .from('approval_workflows')
        .select(`
          id,
          invoice_id,
          current_step,
          steps,
          invoices!inner(
            id,
            invoice_number,
            vendor_name,
            amount
          )
        `)
        .eq('status', 'pending')
        .limit(limit);

      if (error) {
        throw error;
      }

      const approvals = (data || [])
        .filter(workflow => {
          const currentStep = workflow.steps?.[workflow.current_step - 1];
          return currentStep?.userId === userId;
        })
        .map(workflow => {
          const currentStep = workflow.steps?.[workflow.current_step - 1];
          return {
            workflowId: workflow.id,
            invoiceId: workflow.invoice_id,
            invoice_number: workflow.invoices.invoice_number,
            vendor_name: workflow.invoices.vendor_name,
            amount: workflow.invoices.amount,
            currentStep: workflow.current_step,
            deadline: currentStep?.deadline,
          };
        });

      console.log(`✅ Found ${approvals.length} pending approvals for user ${userId}`);

      return {
        approvals,
        count: approvals.length,
      };
    } catch (error) {
      console.error('❌ Failed to get pending approvals:', error);
      return {
        approvals: [],
        count: 0,
      };
    }
  },
});

// Tool to submit invoice for reimbursement
export const submitReimbursementTool = new Tool({
  id: 'submit-reimbursement',
  description: 'Submit an invoice for employee reimbursement',
  inputSchema: z.object({
    invoiceId: z.string(),
    employeeId: z.string(),
    employeeName: z.string(),
    employeeEmail: z.string().optional(),
    reimbursementAmount: z.number(),
    currency: z.string().default('USD'),
    expenseCategory: z.string().optional(),
    businessPurpose: z.string(),
    reimbursementDate: z.string().optional(), // YYYY-MM-DD format
  }),
  outputSchema: z.object({
    success: z.boolean(),
    reimbursementId: z.string().optional(),
    message: z.string(),
  }),
  execute: async ({ context: { invoiceId, employeeId, employeeName, employeeEmail, reimbursementAmount, currency, expenseCategory, businessPurpose, reimbursementDate } }) => {
    try {
      console.log(`💰 Submitting reimbursement for invoice ${invoiceId}...`);

      // First, check if the invoice exists and get its details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error(`Invoice not found: ${invoiceId}`);
      }

      // Check if reimbursement already exists for this user and invoice (by checking description)
      const { data: existingReimbursements, error: checkError } = await supabase
        .from('reimbursements')
        .select('id, description')
        .eq('user_id', employeeId)
        .ilike('description', `%Invoice: ${invoice.invoice_number}%`);

      if (existingReimbursements && existingReimbursements.length > 0) {
        return {
          success: false,
          message: 'Reimbursement request already exists for this invoice',
        };
      }

      // Create reimbursement record using the actual schema
      const reimbursementData = {
        user_id: employeeId,
        amount: reimbursementAmount,
        description: `${businessPurpose} - Invoice: ${invoice.invoice_number} from ${invoice.vendor_name}`,
        category: expenseCategory || 'General',
        status: 'pending',
        receipt_url: null, // Can be added later if needed
      };

      const { data: reimbursement, error: reimbursementError } = await supabase
        .from('reimbursements')
        .insert(reimbursementData)
        .select()
        .single();

      if (reimbursementError) {
        throw reimbursementError;
      }

      console.log(`✅ Reimbursement submitted with ID: ${reimbursement.id}`);

      // Update invoice status to indicate it's been submitted for reimbursement
      await supabase
        .from('invoices')
        .update({ 
          status: 'pending',
          notes: `Submitted for reimbursement by ${employeeName}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      return {
        success: true,
        reimbursementId: reimbursement.id,
        message: `Reimbursement submitted successfully! Amount: ${currency}${reimbursementAmount}`,
      };
    } catch (error) {
      console.error('❌ Failed to submit reimbursement:', error);
      return {
        success: false,
        message: `Failed to submit reimbursement: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Tool to get reimbursements for a user
export const getUserReimbursementsTool = new Tool({
  id: 'get-user-reimbursements',
  description: 'Get reimbursements for a specific user',
  inputSchema: z.object({
    employeeId: z.string(),
    status: z.string().optional(),
    limit: z.number().default(10),
  }),
  outputSchema: z.object({
    reimbursements: z.array(z.object({
      id: z.string(),
      invoice_id: z.string(),
      employee_name: z.string(),
      employee_email: z.string().optional(),
      business_purpose: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      created_at: z.string(),
      vendor_name: z.string(),
      invoice_number: z.string(),
      invoice_date: z.string().optional(),
    })),
    totalAmount: z.number(),
    count: z.number(),
  }),
  execute: async ({ context: { employeeId, status, limit } }) => {
    try {
      console.log(`📋 Getting reimbursements for employee ${employeeId}...`);

      // Get reimbursements with user profile information
      let query = supabase
        .from('reimbursements')
        .select(`
          id,
          user_id,
          amount,
          description,
          category,
          status,
          created_at,
          approved_at,
          approved_by,
          profiles!reimbursements_user_id_fkey!inner(
            full_name,
            email
          )
        `)
        .eq('user_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const reimbursements = (data || []).map(reimbursement => {
        // Extract invoice info from description if available
        const invoiceNumberMatch = reimbursement.description.match(/Invoice: ([^\s]+)/);
        const vendorMatch = reimbursement.description.match(/from (.+)$/);
        
        return {
          id: reimbursement.id,
          invoice_id: null, // Not stored directly
          employee_name: reimbursement.profiles?.full_name || 'Unknown User',
          employee_email: reimbursement.profiles?.email || null,
          business_purpose: reimbursement.description,
          amount: reimbursement.amount,
          currency: 'USD', // Default since not stored
          status: reimbursement.status,
          created_at: reimbursement.created_at,
          vendor_name: vendorMatch ? vendorMatch[1] : null,
          invoice_number: invoiceNumberMatch ? invoiceNumberMatch[1] : null,
          invoice_date: null, // Not available without invoice join
        };
      });

      const totalAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0);

      console.log(`✅ Found ${reimbursements.length} reimbursements for employee ${employeeId}`);

      return {
        reimbursements,
        totalAmount,
        count: reimbursements.length,
      };
    } catch (error) {
      console.error('❌ Failed to get reimbursements:', error);
      return {
        reimbursements: [],
        totalAmount: 0,
        count: 0,
      };
    }
  },
}); 