import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing...');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, JPG, or PNG files only.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);



    // Dynamic import to avoid build issues
    const { executeInvoiceProcessingWorkflow } = await import('@/mastra/workflows/invoice-processing-workflow');

    // Execute the complete invoice processing workflow using Mastra
    const workflowResult = await executeInvoiceProcessingWorkflow(
      fileBuffer,
      file.name,
      file.type,
      userId
    );

    // Extract the actual result from Mastra workflow structure
    const stepResult = workflowResult?.outputs?.[0] || workflowResult?.result || workflowResult;

    // Format response
    const response = {
      success: stepResult.success || false,
      message: stepResult.message || (stepResult.success 
        ? 'Invoice processed successfully' 
        : 'Invoice processing failed'),
      data: {
        invoiceId: stepResult.invoiceId,
        extractedData: stepResult.extractedData,
      },
      timestamp: new Date().toISOString(),
    };



    return NextResponse.json(response, {
      status: stepResult.success ? 200 : 500
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during invoice processing',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 