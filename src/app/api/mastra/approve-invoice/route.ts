import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Processing approval decision...');

    const body = await request.json();
    const { workflowId, decision, approverId, stepNumber, comments } = body;

    // Validate required fields
    if (!workflowId || !decision || !approverId || stepNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowId, decision, approverId, stepNumber' },
        { status: 400 }
      );
    }

    // Validate decision type
    if (!['approve', 'reject', 'escalate'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approve", "reject", or "escalate"' },
        { status: 400 }
      );
    }

    console.log(`📝 Processing ${decision} decision for workflow ${workflowId} by user ${approverId}`);

    // Dynamic import to avoid build issues
    const { processApprovalDecision } = await import('@/mastra/workflows/approval-workflow');

    // Execute the approval workflow using Mastra
    const workflowResult = await processApprovalDecision(
      workflowId,
      decision,
      approverId,
      stepNumber,
      comments
    );

    const response = {
      success: workflowResult.success,
      message: workflowResult.success 
        ? `${decision} decision processed successfully` 
        : 'Failed to process approval decision',
      data: {
        workflowId,
        decision,
        completed: workflowResult.completed,
        nextStep: workflowResult.nextStep,
        notificationsSent: workflowResult.notificationsSent,
        updatedStatus: workflowResult.updatedStatus,
        approverId,
        processedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const statusCode = workflowResult.success ? 200 : 500;
    
    console.log(`✅ Approval decision processed: ${decision} - ${workflowResult.success ? 'SUCCESS' : 'FAILED'}`);

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('❌ Approval decision API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during approval processing',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 