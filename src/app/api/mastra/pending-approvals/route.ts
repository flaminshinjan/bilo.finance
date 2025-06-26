import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('⏳ Getting pending approvals...');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid build issues
    const { getUserPendingApprovals } = await import('@/mastra/agents/approval-workflow-agent');

    // Use the approval workflow agent to get pending approvals
    const agentResponse = await getUserPendingApprovals(userId, limit);

    const response = {
      success: true,
      message: `Retrieved pending approvals for user ${userId}`,
      data: {
        approvals: agentResponse.approvals || [],
        count: agentResponse.count || 0,
        userId,
        limit,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Pending approvals retrieved: ${response.data.count} items`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Pending approvals API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve pending approvals',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 