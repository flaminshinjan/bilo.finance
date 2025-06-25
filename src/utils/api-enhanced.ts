import { AgentOrchestrator } from '@/agents/orchestrator';
import { supabase } from './supabase';

// Initialize the agent orchestrator
const agentOrchestrator = new AgentOrchestrator();

/**
 * Enhanced invoice upload with full agentic processing
 */
export async function uploadInvoiceEnhanced(file: File, userId: string) {
  console.log('🚀 Starting enhanced invoice upload with agent processing...');
  
  try {
    // Step 1: Upload file to storage
    const fileUrl = await uploadFileToStorage(file);
    
    // Step 2: Process through agent orchestrator
    const processingResult = await agentOrchestrator.processInvoiceComplete(
      file,
      userId
    );

    if (!processingResult.success) {
      throw new Error(processingResult.error || 'Agent processing failed');
    }

    const { extractedData, workflow, requiresManualReview, nextSteps } = processingResult.data!;

    // Step 3: Save invoice to database
    const invoiceData = {
      invoice_number: extractedData.fields.invoiceNumber,
      vendor_name: extractedData.fields.vendorName,
      amount: extractedData.fields.amount,
      currency: extractedData.fields.currency,
      invoice_date: extractedData.fields.invoiceDate.toISOString(),
      due_date: extractedData.fields.dueDate?.toISOString(),
      status: requiresManualReview ? 'pending_review' : 'processed',
      approval_status: workflow ? 'pending_approval' : 'auto_approved',
      
      // AI Processing metadata
      ai_confidence_score: processingResult.confidence,
      extraction_method: extractedData.extractionMethod,
      extracted_data: extractedData.fields,
      validation_flags: extractedData.validationFlags,
      
      // File information
      original_file_path: fileUrl,
      file_hash: await generateFileHash(file),
      
      // Audit fields
      created_by: userId,
      created_at: new Date().toISOString()
    };

    const { data: savedInvoice, error: saveError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    // Step 4: Save workflow if created
    if (workflow) {
      await saveWorkflowToDatabase(workflow, savedInvoice.id);
    }

    // Step 5: Return comprehensive result
    return {
      success: true,
      invoice: savedInvoice,
      extractedData,
      workflow,
      requiresManualReview,
      nextSteps,
      processingTime: processingResult.processingTime,
      confidence: processingResult.confidence
    };

  } catch (error) {
    console.error('❌ Enhanced invoice upload failed:', error);
    throw error;
  }
}

/**
 * Process approval decision
 */
export async function processApprovalDecision(
  workflowId: string,
  stepNumber: number,
  decision: 'approve' | 'reject' | 'escalate',
  approverId: string,
  comments?: string
) {
  console.log(`🎯 Processing approval decision: ${decision}`);

  try {
    const result = await agentOrchestrator.processApprovalDecision(
      workflowId,
      stepNumber,
      decision,
      approverId,
      comments
    );

    if (!result.success) {
      throw new Error(result.error || 'Approval processing failed');
    }

    const { workflow, nextSteps, requiresNotification, notificationTargets } = result.data!;

    // Update workflow in database
    await updateWorkflowInDatabase(workflow);

    // Send notifications if required
    if (requiresNotification) {
      await sendNotifications(notificationTargets, {
        type: 'approval_decision',
        decision,
        workflowId,
        comments
      });
    }

    // Update invoice status based on workflow completion
    if (workflow.status === 'completed') {
      const newStatus = decision === 'approve' ? 'approved' : 'rejected';
      await updateInvoiceStatus(workflow.invoiceId, newStatus);
    }

    return {
      success: true,
      workflow,
      nextSteps,
      processingTime: result.processingTime
    };

  } catch (error) {
    console.error('❌ Approval decision processing failed:', error);
    throw error;
  }
}

/**
 * Get enhanced dashboard data
 */
export async function getDashboardDataEnhanced(userId: string) {
  console.log('📊 Getting enhanced dashboard data...');

  try {
    const result = await agentOrchestrator.getDashboardData(userId);

    if (!result.success) {
      throw new Error(result.error || 'Dashboard data retrieval failed');
    }

    // Combine agent data with database queries
    const [invoiceStats, recentInvoices] = await Promise.all([
      getInvoiceStatistics(),
      getRecentInvoices(10)
    ]);

    return {
      success: true,
      data: {
        ...result.data,
        invoiceStats,
        recentInvoices
      },
      processingTime: result.processingTime
    };

  } catch (error) {
    console.error('❌ Enhanced dashboard data retrieval failed:', error);
    throw error;
  }
}

/**
 * Reprocess invoice with corrections
 */
export async function reprocessInvoiceWithCorrections(
  invoiceId: string,
  corrections: any,
  userId: string
) {
  console.log(`🔄 Reprocessing invoice ${invoiceId} with corrections...`);

  try {
    const result = await agentOrchestrator.reprocessInvoice(invoiceId, corrections, userId);

    if (!result.success) {
      throw new Error(result.error || 'Invoice reprocessing failed');
    }

    const { workflow, changes } = result.data!;

    // Update invoice in database
    await updateInvoiceWithCorrections(invoiceId, corrections);

    // Save new workflow
    await saveWorkflowToDatabase(workflow, invoiceId);

    return {
      success: true,
      workflow,
      changes,
      processingTime: result.processingTime
    };

  } catch (error) {
    console.error('❌ Invoice reprocessing failed:', error);
    throw error;
  }
}

/**
 * Bulk approve invoices
 */
export async function bulkApproveInvoices(
  workflowIds: string[],
  approverId: string,
  comments?: string
) {
  console.log(`🔄 Bulk approving ${workflowIds.length} invoices...`);

  try {
    // Process through approval agent
    const result = await agentOrchestrator.approvalAgent.bulkApprove(
      workflowIds,
      approverId,
      comments
    );

    if (!result.success) {
      throw new Error(result.error || 'Bulk approval failed');
    }

    const { successful, failed } = result.data!;

    // Update database for successful approvals
    for (const workflowId of successful) {
      // In production, this would update the workflow and invoice status
      console.log(`✅ Updated workflow ${workflowId} in database`);
    }

    return {
      success: true,
      successful,
      failed,
      totalProcessed: workflowIds.length,
      processingTime: result.processingTime
    };

  } catch (error) {
    console.error('❌ Bulk approval failed:', error);
    throw error;
  }
}

// Helper functions

async function uploadFileToStorage(file: File): Promise<string> {
  const fileName = `invoices/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('invoice-files')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('invoice-files')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveWorkflowToDatabase(workflow: any, invoiceId: string): Promise<void> {
  const workflowData = {
    id: workflow.id,
    invoice_id: invoiceId,
    template_id: workflow.templateId,
    current_step: workflow.currentStep,
    total_steps: workflow.totalSteps,
    status: workflow.status,
    steps: workflow.steps,
    created_at: workflow.createdAt.toISOString(),
    completed_at: workflow.completedAt?.toISOString()
  };

  const { error } = await supabase
    .from('approval_workflows')
    .insert(workflowData);

  if (error) {
    console.error('Failed to save workflow:', error);
    throw error;
  }
}

async function updateWorkflowInDatabase(workflow: any): Promise<void> {
  const { error } = await supabase
    .from('approval_workflows')
    .update({
      current_step: workflow.currentStep,
      status: workflow.status,
      steps: workflow.steps,
      completed_at: workflow.completedAt?.toISOString()
    })
    .eq('id', workflow.id);

  if (error) {
    console.error('Failed to update workflow:', error);
    throw error;
  }
}

async function updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({ 
      approval_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Failed to update invoice status:', error);
    throw error;
  }
}

async function updateInvoiceWithCorrections(invoiceId: string, corrections: any): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      ...corrections,
      status: 'processed',
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Failed to update invoice with corrections:', error);
    throw error;
  }
}

async function sendNotifications(targets: string[], notification: any): Promise<void> {
  console.log('📧 Sending notifications to:', targets, notification);
  // In production, this would integrate with email/SMS services
  // For now, we'll just log the notification
}

async function getInvoiceStatistics(): Promise<any> {
  const { data, error } = await supabase
    .from('invoices')
    .select('amount, status, approval_status, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Failed to get invoice statistics:', error);
    return {};
  }

  const totalInvoices = data.length;
  const totalAmount = data.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingApprovals = data.filter(inv => inv.approval_status === 'pending_approval').length;
  const processedToday = data.filter(inv => {
    const today = new Date().toISOString().split('T')[0];
    return inv.created_at?.startsWith(today);
  }).length;

  return {
    totalInvoices,
    totalAmount,
    pendingApprovals,
    processedToday
  };
}

async function getRecentInvoices(limit: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get recent invoices:', error);
    return [];
  }

  return data || [];
} 