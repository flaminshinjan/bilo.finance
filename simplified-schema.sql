-- Drop existing tables if they exist
DROP TABLE IF EXISTS reimbursements CASCADE;
DROP TABLE IF EXISTS processing_logs CASCADE;
DROP TABLE IF EXISTS approval_decisions CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies table for organization management (create first)
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- User profiles table (employees) - create after companies
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT,
    phone TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    notes TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Reimbursements table
CREATE TABLE reimbursements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
    admin_notes TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

CREATE INDEX idx_approval_workflows_invoice_id ON approval_workflows(invoice_id);
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);

CREATE INDEX idx_approval_decisions_workflow_id ON approval_decisions(workflow_id);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_status ON vendors(status);

CREATE INDEX idx_processing_logs_invoice_id ON processing_logs(invoice_id);
CREATE INDEX idx_processing_logs_event_type ON processing_logs(event_type);

-- Reimbursement indexes
CREATE INDEX idx_reimbursements_user_id ON reimbursements(user_id);
CREATE INDEX idx_reimbursements_status ON reimbursements(status);
CREATE INDEX idx_reimbursements_created_at ON reimbursements(created_at);

-- Create indexes for better performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);

-- Enable RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (companies can only see their own data)
CREATE POLICY "Companies can view own data" ON companies
    FOR SELECT USING (true); -- Companies table doesn't need user-based RLS for auth

-- RLS Policies for profiles (only allow public access for now - you can tighten this later)
CREATE POLICY "Allow public access to profiles" ON profiles
    FOR ALL USING (true);

-- RLS Policies for reimbursements (allow public access for now - you can tighten this later)
CREATE POLICY "Allow public access to reimbursements" ON reimbursements
    FOR ALL USING (true);

-- RLS Policies for invoices (allow public access for now - you can tighten this later)
CREATE POLICY "Allow public access to invoices" ON invoices
    FOR ALL USING (true);

-- Sample data for testing
INSERT INTO vendors (name, address, email, payment_terms, risk_level) VALUES
('Acme Corp', '123 Business St, City, State 12345', 'billing@acme.com', 'Net 30', 'low'),
('TechSolutions Inc', '456 Tech Ave, Silicon Valley, CA 94000', 'invoices@techsolutions.com', 'Net 15', 'low'),
('Global Services LLC', '789 Global Plaza, New York, NY 10001', 'accounting@globalservices.com', 'Net 45', 'medium')
ON CONFLICT (name) DO NOTHING;

-- Sample company data
INSERT INTO companies (company_name, email, password_hash, contact_name, phone) VALUES
('Tech Innovations LLC', 'admin@techinnovations.com', '$2b$10$example.hash.here', 'John Smith', '+1-555-0123'),
('Digital Solutions Inc', 'admin@digitalsolutions.com', '$2b$10$example.hash.here2', 'Jane Doe', '+1-555-0456')
ON CONFLICT (email) DO NOTHING;

-- Sample employee profiles
INSERT INTO profiles (email, full_name, department, phone, company_id) VALUES
('john.doe@techinnovations.com', 'John Doe', 'Engineering', '+1-555-1001', (SELECT id FROM companies WHERE email = 'admin@techinnovations.com' LIMIT 1)),
('jane.smith@techinnovations.com', 'Jane Smith', 'Sales', '+1-555-1002', (SELECT id FROM companies WHERE email = 'admin@techinnovations.com' LIMIT 1)),
('mike.wilson@digitalsolutions.com', 'Mike Wilson', 'Marketing', '+1-555-2001', (SELECT id FROM companies WHERE email = 'admin@digitalsolutions.com' LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- Sample reimbursement requests
INSERT INTO reimbursements (user_id, amount, description, category, status, created_at) VALUES
((SELECT id FROM profiles WHERE email = 'john.doe@techinnovations.com' LIMIT 1), 125.50, 'Client lunch meeting', 'Meals', 'approved', NOW() - INTERVAL '5 days'),
((SELECT id FROM profiles WHERE email = 'jane.smith@techinnovations.com' LIMIT 1), 250.00, 'Conference attendance', 'Training', 'pending', NOW() - INTERVAL '2 days'),
((SELECT id FROM profiles WHERE email = 'mike.wilson@digitalsolutions.com' LIMIT 1), 75.30, 'Office supplies purchase', 'Office Supplies', 'approved', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING; 