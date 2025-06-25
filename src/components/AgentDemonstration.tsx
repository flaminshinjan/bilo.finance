'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiCheck, FiAlertCircle, FiClock } from 'react-icons/fi';

interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  output?: any;
  confidence?: number;
}

export function AgentDemonstration() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AgentStep[]>([
    {
      id: 'upload',
      name: '📄 Invoice Upload',
      description: 'File uploaded and validated',
      status: 'pending'
    },
    {
      id: 'ocr',
      name: '🤖 AI Processing Agent',
      description: 'Extracting data using OCR and AI models',
      status: 'pending'
    },
    {
      id: 'validation',
      name: '✅ Data Validation',
      description: 'Validating extracted data against business rules',
      status: 'pending'
    },
    {
      id: 'categorization',
      name: '🏷️ Smart Categorization',
      description: 'AI-powered expense categorization',
      status: 'pending'
    },
    {
      id: 'workflow',
      name: '🔄 Approval Workflow Agent',
      description: 'Creating dynamic approval workflow',
      status: 'pending'
    },
    {
      id: 'notification',
      name: '📧 Notifications',
      description: 'Sending notifications to approvers',
      status: 'pending'
    }
  ]);

  const [demoInvoice] = useState({
    fileName: 'adobe-subscription-invoice.pdf',
    vendor: 'Adobe Inc.',
    amount: 2499.99,
    invoiceNumber: 'INV-2024-0847',
    confidence: 0.94
  });

  useEffect(() => {
    if (isRunning && currentStep < steps.length) {
      const timer = setTimeout(() => {
        simulateStep(currentStep);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep]);

  const simulateStep = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => {
      if (index === stepIndex) {
        return {
          ...step,
          status: 'running'
        };
      }
      return step;
    }));

    // Simulate processing time
    setTimeout(() => {
      setSteps(prev => prev.map((step, index) => {
        if (index === stepIndex) {
          const duration = Math.floor(1000 + Math.random() * 2000);
          return {
            ...step,
            status: 'completed',
            duration,
            ...getStepOutput(step.id)
          };
        }
        return step;
      }));

      setCurrentStep(prev => prev + 1);

      // Stop when all steps are completed
      if (stepIndex === steps.length - 1) {
        setIsRunning(false);
      }
    }, 1000 + Math.random() * 2000);
  };

  const getStepOutput = (stepId: string) => {
    switch (stepId) {
      case 'upload':
        return {
          output: {
            fileName: demoInvoice.fileName,
            fileSize: '247 KB',
            fileType: 'PDF'
          }
        };
      case 'ocr':
        return {
          output: {
            vendor: demoInvoice.vendor,
            amount: demoInvoice.amount,
            invoiceNumber: demoInvoice.invoiceNumber,
            extractedFields: 8
          },
          confidence: demoInvoice.confidence
        };
      case 'validation':
        return {
          output: {
            validationsPassed: 12,
            validationsWarning: 1,
            validationsFailed: 0
          },
          confidence: 0.96
        };
      case 'categorization':
        return {
          output: {
            category: 'Software & Subscriptions',
            department: 'Design Team',
            costCenter: 'CC-001'
          },
          confidence: 0.89
        };
      case 'workflow':
        return {
          output: {
            workflowType: 'Standard Approval',
            approvalSteps: 2,
            estimatedTime: '24-48 hours'
          }
        };
      case 'notification':
        return {
          output: {
            notificationsSent: 3,
            approvers: ['manager@company.com', 'finance@company.com']
          }
        };
      default:
        return {};
    }
  };

  const startDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  const pauseDemo = () => {
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending', 
      duration: undefined, 
      output: undefined, 
      confidence: undefined 
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <FiRefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          🤖 Agentic Invoice Processing Demo
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Watch our AI agents process an invoice in real-time
        </p>
        
        {/* Demo Invoice Info */}
        <div className="inline-flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Demo Invoice:</span> {demoInvoice.fileName}
          </div>
          <div className="text-sm">
            <span className="font-medium">Vendor:</span> {demoInvoice.vendor}
          </div>
          <div className="text-sm">
            <span className="font-medium">Amount:</span> ${demoInvoice.amount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={startDemo}
          disabled={isRunning}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiPlay className="w-5 h-5" />
          <span>Start Demo</span>
        </button>
        
        <button
          onClick={pauseDemo}
          disabled={!isRunning}
          className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiPause className="w-5 h-5" />
          <span>Pause</span>
        </button>
        
        <button
          onClick={resetDemo}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Agent Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border-2 rounded-lg p-6 transition-all duration-300 ${getStatusColor(step.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {step.name}
                    </h3>
                    {step.confidence && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Confidence: {(step.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  
                  {step.duration && (
                    <div className="text-sm text-gray-500 mt-2">
                      Processing time: {step.duration}ms
                    </div>
                  )}
                  
                  {/* Step Output */}
                  {step.output && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Output:
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(step.output).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {currentStep >= steps.length && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="text-center space-y-4">
            <div className="text-2xl">🎉</div>
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-400">
              Invoice Processing Complete!
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-800 dark:text-green-400">Processing Time</div>
                <div className="text-green-600 dark:text-green-500">
                  {steps.reduce((total, step) => total + (step.duration || 0), 0)}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-800 dark:text-green-400">Overall Confidence</div>
                <div className="text-green-600 dark:text-green-500">94.2%</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-800 dark:text-green-400">Approval Steps</div>
                <div className="text-green-600 dark:text-green-500">2 Required</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-800 dark:text-green-400">Manual Review</div>
                <div className="text-green-600 dark:text-green-500">Not Required</div>
              </div>
            </div>
            <p className="text-green-700 dark:text-green-300">
              Invoice has been automatically processed and routed for approval. 
              Notifications sent to relevant approvers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 