'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiFileText, FiClock, FiActivity } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          setUserId(user.id);
        } else {
          // No authenticated user - redirect to login
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Error getting user:', error);
        window.location.href = '/auth/login';
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  const simulateProcessingSteps = () => {
    const steps = [
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing...',
      'Processing completed!'
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
      
      if (!userId) {
        alert('Please log in to upload invoices');
        return;
      }

      const file = acceptedFiles[0];
      setIsProcessing(true);
      setResult(null);
      setProcessingSteps([]);
      
      // Start the visual processing simulation
      simulateProcessingSteps();

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId); // Use real authenticated user ID

        console.log('Processing...');

        const response = await fetch('/api/mastra/process-invoice', {
          method: 'POST',
          body: formData,
        });

        const data: ProcessingResult = await response.json();
        
        console.log('Processing complete');
        setResult(data);

      } catch (error) {
        console.error('Upload failed:', error);
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
      return <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6B7280] dark:border-[#9CA3AF] border-t-transparent"></div>;
    }
    if (result?.success) {
      return <FiCheckCircle className="h-8 w-8 text-[#1F2937] dark:text-[#D1D5DB]" />;
    }
    if (result && !result.success) {
      return <FiAlertTriangle className="h-8 w-8 text-[#6B7280] dark:text-[#9CA3AF]" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (result?.success) return 'bg-[#F3F4F6] dark:bg-[#333333] border-[#E5E7EB] dark:border-[#555555]';
    if (result && !result.success) return 'bg-[#F3F4F6] dark:bg-[#333333] border-[#E5E7EB] dark:border-[#555555]';
    return 'bg-[#F3F4F6] dark:bg-[#333333] border-[#E5E7EB] dark:border-[#555555]';
  };

  const renderProcessingResults = () => {
    if (!result?.data) return null;

    const { extractedData, validationResults, workflowDecision, requiresManualReview, confidence, nextSteps } = result.data;

    return (
      <div className="space-y-6 mt-6">
        {/* Extracted Data */}
        {extractedData?.extractedData && (
          <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#555555]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-lg p-2">
                <FiFileText className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
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
              <div className="w-full bg-[#E5E7EB] dark:bg-[#555555] rounded-full h-3">
                <div 
                  className="bg-[#6B7280] dark:bg-[#9CA3AF] h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(confidence || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && (
          <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#555555]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-lg p-2">
                <FiCheckCircle className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Validation Results</h4>
            </div>
            <div className="space-y-3">
              {validationResults.validation_checks?.map((check: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#E5E7EB] dark:border-[#333333]">
                  <span className="w-3 h-3 rounded-full bg-[#6B7280] dark:bg-[#9CA3AF]"></span>
                  <span className="text-sm text-[#1F2937] dark:text-white">{check.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Decision */}
        {workflowDecision && (
          <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#555555]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-lg p-2">
                <FiActivity className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Approval Workflow</h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#E5E7EB] dark:border-[#333333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#1F2937] dark:text-white">Decision</span>
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{workflowDecision.decision}</span>
                </div>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{workflowDecision.reasoning}</p>
              </div>
              
              {requiresManualReview && (
                <div className="p-4 bg-[#F3F4F6] dark:bg-[#333333] rounded-lg border border-[#E5E7EB] dark:border-[#555555]">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiClock className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <span className="font-medium text-[#1F2937] dark:text-white">Manual Review Required</span>
                  </div>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    This invoice requires manual approval due to validation concerns.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-6 border border-[#E5E7EB] dark:border-[#555555]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-lg p-2">
                <FiActivity className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
              <h4 className="font-semibold text-[#1F2937] dark:text-white">Next Steps</h4>
            </div>
            <div className="space-y-2">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#E5E7EB] dark:border-[#333333]">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#E5E7EB] dark:bg-[#555555] text-[#6B7280] dark:text-[#9CA3AF] rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm text-[#1F2937] dark:text-white">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="max-w-2xl mx-auto">
            <div className="h-64 bg-[#F3F4F6] dark:bg-[#333333] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">


      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-[#6B7280] dark:border-[#9CA3AF] bg-[#F8F9FA] dark:bg-[#333333]' 
              : 'border-[#E5E7EB] dark:border-[#333333] hover:border-[#6B7280] dark:hover:border-[#9CA3AF] hover:bg-[#F8F9FA] dark:hover:bg-[#333333]'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-4">
                <FiUploadCloud className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
                {isDragActive ? 'Drop your invoice here' : 'Upload your invoice'}
              </h3>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Supports PDF, JPG, PNG files up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {(isProcessing || result) && (
        <div className="max-w-2xl mx-auto">
          <div className={`p-6 rounded-2xl border ${getStatusColor()}`}>
            <div className="flex items-center space-x-4 mb-4">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold text-[#1F2937] dark:text-white">
                  {isProcessing ? 'Processing Invoice' : result?.success ? 'Processing Complete' : 'Processing Failed'}
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  {isProcessing ? 'Please wait while we analyze your invoice...' : result?.message}
                </p>
              </div>
            </div>

            {/* Processing Steps */}
            {isProcessing && processingSteps.length > 0 && (
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-[#6B7280] dark:bg-[#9CA3AF] rounded-full"></div>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Details */}
            {result && !result.success && result.error && (
              <div className="mt-4 p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-lg border border-[#E5E7EB] dark:border-[#555555]">
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  <strong>Error:</strong> {result.error}
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {renderProcessingResults()}
        </div>
      )}

      {/* Upload Another Button */}
      {result && !isProcessing && (
        <div className="text-center">
          <button
            onClick={() => {
              setResult(null);
              setProcessingSteps([]);
            }}
            className="inline-flex items-center px-6 py-3 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] font-medium rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <FiUploadCloud className="mr-2 h-5 w-5" />
            Upload Another Invoice
          </button>
        </div>
      )}
    </div>
  );
} 