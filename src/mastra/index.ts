import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Dynamic imports to avoid server-side issues
let mastraInstance: Mastra | null = null;

export async function getMastra() {
  if (mastraInstance) {
    return mastraInstance;
  }

  // Only initialize on server-side or when needed
  if (typeof window === 'undefined') {
    const { invoiceProcessingAgent } = await import('./agents/invoice-processing-agent');
    const { invoiceProcessingWorkflow } = await import('./workflows/invoice-processing-workflow');

    mastraInstance = new Mastra({
      agents: { 
        invoiceProcessingAgent,
      },
      workflows: { 
        invoiceProcessingWorkflow,
      },
      storage: new LibSQLStore({
        url: process.env.DATABASE_URL || ":memory:",
      }),
      logger: new PinoLogger({
        name: 'BiloFinance',
        level: 'info',
      }),
    });
  }

  return mastraInstance;
}

// Backwards compatibility export
export const mastra = {
  async getInstance() {
    return await getMastra();
  }
}; 