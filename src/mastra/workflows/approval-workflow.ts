import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';

const processApprovalStep = createStep({
  id: 'process-approval',
  inputSchema: z.object({
    workflowId: z.string(),
    decision: z.enum(['approve', 'reject', 'escalate']),
    approverId: z.string(),
    comments: z.string().optional(),
    stepNumber: z.number(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    completed: z.boolean(),
    decision: z.string(),
    timestamp: z.string(),
    message: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { workflowId, decision, approverId, stepNumber } = inputData;
    
    console.log(`🔍 Processing approval for workflow ${workflowId}`);
    console.log(`📝 ${decision} decision by ${approverId} for step ${stepNumber}`);
    
    // Simulate approval processing
    const completed = decision === 'approve' || decision === 'reject';
    const message = completed 
      ? `Approval workflow ${decision === 'approve' ? 'approved' : 'rejected'}`
      : 'Approval escalated to next level';
    
    return {
      success: true,
      completed,
      decision,
      timestamp: new Date().toISOString(),
      message,
    };
  },
});

export const approvalWorkflow = createWorkflow({
  id: 'approval-workflow',
  inputSchema: z.object({
    workflowId: z.string(),
    decision: z.enum(['approve', 'reject', 'escalate']),
    approverId: z.string(),
    comments: z.string().optional(),
    stepNumber: z.number(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    completed: z.boolean(),
    decision: z.string(),
    timestamp: z.string(),
    message: z.string(),
  }),
  steps: [processApprovalStep],
})
  .then(processApprovalStep)
  .commit();

export async function processApprovalDecision(
  workflowId: string,
  decision: 'approve' | 'reject' | 'escalate',
  approverId: string,
  stepNumber: number,
  comments?: string
) {
  try {
    console.log(`🎯 Processing approval decision: ${decision} for workflow ${workflowId}`);
    
    const run = await approvalWorkflow.createRunAsync();
    const result = await run.start({
      inputData: {
        workflowId,
        decision,
        approverId,
        comments,
        stepNumber,
      },
    });
    
    console.log('✅ Approval decision processed successfully');
    return result;
  } catch (error) {
    console.error('❌ Approval decision processing failed:', error);
    throw error;
  }
}

// Helper function to get dashboard data for due invoices
export async function getDashboardData(userId: string) {
  try {
    console.log(`📊 Getting dashboard data for user: ${userId}`);
    
    // This would typically involve multiple queries and agent calls
    // For now, we'll return mock data structure
    
    const dashboardData = {
      pendingApprovals: [],
      dueInvoices: [],
      recentActivity: [],
      statistics: {
        totalInvoices: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        processingTime: 0,
      },
    };
    
    console.log('✅ Dashboard data retrieved');
    return dashboardData;
  } catch (error) {
    console.error('❌ Failed to get dashboard data:', error);
    throw error;
  }
}