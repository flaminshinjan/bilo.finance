'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiFileText, FiClock, FiActivity } from 'react-icons/fi';

interface ProcessingResult {
  success: boolean;
  message: string;
  data?: {
    invoiceId?: string;
    extractedData?: any;
    validationResults?: any;
    workflowDecision?: any;
    requiresManualReview?: boolean;
    nextSteps?: string[];
    confidence?: number;
    timeline?: any;
  };
  error?: string;
  timestamp: string;
}

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const simulateProcessingSteps = () => {
    const steps = [
      '🔍 Extracting data from invoice...',
      '🤖 AI analyzing document structure...',
      '✅ Data extraction completed',
      '🔍 Validating extracted information...',
      '📊 Running business rule checks...',
      '⚡ Determining approval workflow...',
      '💾 Saving to database...',
      '🎯 Creating approval workflow...',
      '📧 Sending notifications...',
      '✅ Processing completed!'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProcessingSteps(prev => [...prev, step]);
      }, index * 800);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsProcessing(true);
      setResult(null);
      setProcessingSteps([]);
      
      // Start the visual processing simulation
      simulateProcessingSteps();

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', 'user-123'); // In a real app, get from auth context

        console.log('🚀 Uploading file to Mastra API:', file.name);

        const response = await fetch('/api/mastra/process-invoice', {
          method: 'POST',
          body: formData,
        });

        const data: ProcessingResult = await response.json();
        
        console.log('📄 Processing result:', data);
        setResult(data);

      } catch (error) {
        console.error('❌ Upload failed:', error);
        setResult({
          success: false,
          message: 'Upload failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsProcessing(false);
      }
    }
  });

  const getStatusIcon = () => {
    if (isProcessing) {
      return <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B5CF6] border-t-transparent"></div>;
    }
    if (result?.success) {
      return <FiCheckCircle className="h-8 w-8 text-[#10B981]" />;
    }
    if (result && !result.success) {
      return <FiAlertTriangle className="h-8 w-8 text-[#EF4444]" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (result?.success) return 'bg-[#10B981]/10 border-[#10B981]/20';
    if (result && !result.success) return 'bg-[#EF4444]/10 border-[#EF4444]/20';
    return 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20';
  };

  const renderProcessingResults = () => {
    if (!result?.data) return null;

    const { extractedData, validationResults, workflowDecision, requiresManualReview, confidence, nextSteps } = result.data;

    return (
      <div className="space-y-6 mt-6">
        {/* Extracted Data */}
        {extractedData?.extractedData && (
          <div className="bg-[#F8F9FA] dark:bg-[#374151] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#8B5CF6]/10 rounded-lg p-2">
                <FiFileText className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Extracted Invoice Data</h4>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Invoice Number</span>
                <p className="text-[#1F2937] dark:text-white font-medium">{extractedData.extractedData.invoiceNumber}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Vendor</span>
                <p className="text-[#1F2937] dark:text-white font-medium">{extractedData.extractedData.vendorName}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Amount</span>
                <p className="text-[#1F2937] dark:text-white font-medium">${extractedData.extractedData.amount?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Date</span>
                <p className="text-[#1F2937] dark:text-white font-medium">{extractedData.extractedData.invoiceDate}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Confidence Score</span>
                <span className="text-sm font-medium text-[#1F2937] dark:text-white">{((confidence || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-[#4B5563] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(confidence || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && (
          <div className="bg-[#F8F9FA] dark:bg-[#374151] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#10B981]/10 rounded-lg p-2">
                <FiCheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Validation Results</h4>
            </div>
            <div className="space-y-3">
              {validationResults.validation_checks?.map((check: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#1A1A2E] rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                  <span className={`w-3 h-3 rounded-full ${
                    check.status === 'passed' ? 'bg-[#10B981]' : 
                    check.status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                  }`}></span>
                  <span className="text-sm text-[#1F2937] dark:text-white">{check.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Decision */}
        {workflowDecision && (
          <div className="bg-[#F8F9FA] dark:bg-[#374151] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#3B82F6]/10 rounded-lg p-2">
                <FiActivity className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Approval Workflow</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#6B7280] dark:text-[#9CA3AF]">Workflow Type</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workflowDecision.workflow_type === 'auto_approve' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    : workflowDecision.workflow_type === 'single_approval'
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                }`}>
                  {workflowDecision.workflow_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] bg-white dark:bg-[#1A1A2E] p-3 rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                {workflowDecision.reasoning}
              </p>
            </div>
          </div>
        )}

        {/* Manual Review Warning */}
        {requiresManualReview && (
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <FiAlertTriangle className="h-6 w-6 text-[#F59E0B]" />
              <div>
                <h4 className="font-semibold text-[#1F2937] dark:text-white">Manual Review Required</h4>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm mt-1">
                  This invoice requires manual review due to validation issues or low confidence score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#3B82F6]/10 rounded-lg p-2">
                <FiClock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Next Steps</h4>
            </div>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="text-sm text-[#1F2937] dark:text-white flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#3B82F6] rounded-full mt-2 flex-shrink-0"></span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Upload Invoice</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Upload PDF, JPG, or PNG invoices for AI-powered processing and approval workflow management.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden">
        <div
          {...getRootProps()}
          className={`relative p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'bg-[#8B5CF6]/5 border-[#8B5CF6] border-2 border-dashed' 
              : 'hover:bg-[#F8F9FA] dark:hover:bg-[#374151]/30 border-2 border-dashed border-[#E5E7EB] dark:border-[#374151]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-6">
            <div className="bg-[#8B5CF6]/10 rounded-2xl p-4 w-fit mx-auto">
              <FiUploadCloud className="w-12 h-12 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#1F2937] dark:text-white mb-2">
                {isDragActive ? 'Drop your invoice here' : 'Upload an invoice'}
              </p>
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                Drag and drop or click to select • PDF, JPG, PNG • Max 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {(isProcessing || result) && (
        <div className={`rounded-2xl border p-8 ${getStatusColor()}`}>
          <div className="flex items-center space-x-4 mb-6">
            {getStatusIcon()}
            <div>
              <h3 className="text-xl font-semibold text-[#1F2937] dark:text-white">
                {isProcessing ? 'Processing Invoice...' : result?.message}
              </h3>
              {result?.timestamp && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                  Processed at {new Date(result.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Processing Steps */}
          {isProcessing && processingSteps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-[#1F2937] dark:text-white mb-4">Processing Steps</h4>
              <div className="space-y-3">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] bg-white dark:bg-[#1A1A2E] p-3 rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse"></div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {result && !result.success && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="h-5 w-5 text-[#EF4444]" />
                <p className="text-[#EF4444] text-sm font-medium">{result.error || 'Processing failed'}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result?.success && renderProcessingResults()}
        </div>
      )}

      {/* Info Cards */}
      <div>
        <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1A1A2E] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#374151] hover:shadow-lg transition-all duration-200">
            <div className="bg-[#8B5CF6]/10 rounded-xl p-3 w-fit mb-4">
              <FiFileText className="h-8 w-8 text-[#8B5CF6]" />
            </div>
            <h3 className="font-semibold text-[#1F2937] dark:text-white mb-2">AI-Powered Extraction</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Advanced OCR and ML models extract data with high accuracy from your invoices
            </p>
          </div>
          
          <div className="bg-white dark:bg-[#1A1A2E] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#374151] hover:shadow-lg transition-all duration-200">
            <div className="bg-[#10B981]/10 rounded-xl p-3 w-fit mb-4">
              <FiCheckCircle className="h-8 w-8 text-[#10B981]" />
            </div>
            <h3 className="font-semibold text-[#1F2937] dark:text-white mb-2">Smart Validation</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Intelligent validation checks ensure data quality and compliance with your policies
            </p>
          </div>
          
          <div className="bg-white dark:bg-[#1A1A2E] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#374151] hover:shadow-lg transition-all duration-200">
            <div className="bg-[#3B82F6]/10 rounded-xl p-3 w-fit mb-4">
              <FiActivity className="h-8 w-8 text-[#3B82F6]" />
            </div>
            <h3 className="font-semibold text-[#1F2937] dark:text-white mb-2">Automated Workflows</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Dynamic approval routing based on your business policies and risk assessment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 