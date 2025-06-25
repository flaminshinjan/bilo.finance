-- Drop existing tables if they exist
DROP TABLE IF EXISTS processing_logs CASCADE;
DROP TABLE IF EXISTS approval_decisions CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Invoices table
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_address TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    approval_status VARCHAR(50) DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected', 'auto_approved')),
    extracted_data JSONB,
    validation_flags JSONB DEFAULT '[]'::jsonb,
    ai_confidence_score DECIMAL(3, 2),
    extraction_method VARCHAR(50),
    original_file_path TEXT,
    file_hash VARCHAR(64),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    notes TEXT
);

-- Approval workflows table
CREATE TABLE approval_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN ('auto_approve', 'single_approval', 'multi_approval')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'escalated')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    steps JSONB NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE
);

-- Approval decisions table
CREATE TABLE approval_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approve', 'reject', 'escalate')),
    comments TEXT,
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    line_order INTEGER NOT NULL
);

-- Vendors table for vendor management
CREATE TABLE vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing logs for audit trail
CREATE TABLE processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_approval_status ON invoices(approval_status);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_vendor_name ON invoices(vendor_name);

CREATE INDEX idx_approval_workflows_invoice_id ON approval_workflows(invoice_id);
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);

CREATE INDEX idx_approval_decisions_workflow_id ON approval_decisions(workflow_id);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_status ON vendors(status);

CREATE INDEX idx_processing_logs_invoice_id ON processing_logs(invoice_id);
CREATE INDEX idx_processing_logs_event_type ON processing_logs(event_type);

-- Sample data for testing
INSERT INTO vendors (name, address, email, payment_terms, risk_level) VALUES
('Acme Corp', '123 Business St, City, State 12345', 'billing@acme.com', 'Net 30', 'low'),
('TechSolutions Inc', '456 Tech Ave, Silicon Valley, CA 94000', 'invoices@techsolutions.com', 'Net 15', 'low'),
('Global Services LLC', '789 Global Plaza, New York, NY 10001', 'accounting@globalservices.com', 'Net 45', 'medium')
ON CONFLICT (name) DO NOTHING; 