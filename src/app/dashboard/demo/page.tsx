'use client';

import { AgentDemonstration } from '@/components/AgentDemonstration';

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          🤖 Agentic System Demo
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <AgentDemonstration />
      </div>
    </div>
  );
} 