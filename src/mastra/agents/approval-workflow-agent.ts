import { Agent } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { createApprovalWorkflowTool, getPendingApprovalsTool, updateInvoiceStatusTool } from '../tools/supabase-operations';

export const approvalWorkflowAgent = new Agent({
  name: 'Approval Workflow Agent',
  instructions: `
You are an expert AI agent specialized in managing approval workflows for the Bilo Finance platform. You intelligently route invoices through appropriate approval processes based on company policies and risk assessments.

**Core Responsibilities:**
1. **Workflow Determination**: Analyze invoice data to determine the appropriate approval workflow type
2. **Approver Assignment**: Select the right approvers based on amount, department, and vendor type
3. **Timeline Management**: Set appropriate deadlines and escalation timelines
4. **Policy Enforcement**: Apply company approval policies and spending limits
5. **Process Automation**: Auto-approve low-risk invoices when appropriate

**Approval Rules:**
- Auto-approve: Invoices under $500 from known vendors with high confidence scores
- Single approval: Invoices $500-$5,000 require manager approval
- Multi-approval: Invoices over $5,000 require department head + finance approval
- Executive approval: Invoices over $25,000 require C-level approval

**Workflow Types:**
1. **auto_approve**: Low-risk, small amounts from trusted vendors
2. **single_approval**: Standard invoices requiring one approval
3. **multi_approval**: High-value or high-risk invoices requiring multiple approvals

**Risk Factors Affecting Workflow:**
- Invoice amount and frequency
- Vendor trust level and history
- Expense category and urgency
- Data extraction confidence score
- Validation results and flags

**Output Requirements:**
Always provide clear reasoning for workflow decisions and ensure appropriate approvers are assigned with realistic deadlines.
`,
  model: anthropic('claude-sonnet-4-20250514'),
  tools: {
    createApprovalWorkflow: createApprovalWorkflowTool,
    getPendingApprovals: getPendingApprovalsTool,
    updateInvoiceStatus: updateInvoiceStatusTool,
  },
});

// Helper function to determine and create approval workflow
export async function createApprovalWorkflowForInvoice(
  invoiceData: any,
  validationResult: any,
  userId: string
) {
  try {
    console.log('🔄 Approval Workflow Agent: Determining workflow...');

    const outputSchema = z.object({
      workflow_decision: z.object({
        workflow_type: z.enum(['auto_approve', 'single_approval', 'multi_approval']),
        reasoning: z.string(),
        confidence: z.number(),
      }),
      approvers: z.array(z.object({
        userId: z.string(),
        role: z.string(),
        order: z.number(),
        deadline: z.string().optional(),
        reasoning: z.string(),
      })),
      timeline: z.object({
        estimated_completion: z.string(),
        priority_level: z.enum(['low', 'medium', 'high', 'urgent']),
      }),
      automation_flags: z.array(z.object({
        flag: z.string(),
        action: z.string(),
        condition: z.string(),
      })),
      next_steps: z.array(z.string()),
    });

    const response = await approvalWorkflowAgent.generate(
      `Please analyze this invoice and create an appropriate approval workflow.

Invoice Data:
${JSON.stringify(invoiceData, null, 2)}

Validation Results:
${JSON.stringify(validationResult, null, 2)}

Created by: ${userId}

Please:
1. Determine the appropriate workflow type based on amount, risk, and validation results
2. Assign suitable approvers with realistic deadlines
3. Set priority level and estimated completion time
4. Create the workflow using the createApprovalWorkflow tool if not auto-approved
5. Provide clear reasoning for all decisions

Consider company policies and the validation results when making your decision.`,
      {
        output: outputSchema,
      }
    );

    return response;
  } catch (error) {
    console.error('❌ Approval Workflow Agent failed:', error);
    throw error;
  }
}

// Helper function to get pending approvals for a user
export async function getUserPendingApprovals(userId: string, limit = 10) {
  try {
    console.log(`📋 Getting pending approvals for user: ${userId}`);

    const response = await approvalWorkflowAgent.generate(
      `Please get all pending approvals for user ${userId}. Use the getPendingApprovals tool to fetch the data and provide a summary of urgent items and recommendations for prioritization.`,
      {
        toolChoice: 'required',
      }
    );

    return response;
  } catch (error) {
    console.error('❌ Failed to get pending approvals:', error);
    throw error;
  }
} 