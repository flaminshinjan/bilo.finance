-- Enable necessary extensions
create extension if not exists "vector" with schema "public";

-- Create enum types
create type public.invoice_status as enum ('pending', 'processed', 'error');
create type public.reimbursement_status as enum ('pending', 'approved', 'rejected');

-- Create companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  address text,
  tax_id text,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create employees table
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company_id uuid references public.companies not null,
  employee_id text not null,
  full_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(company_id, employee_id)
);

-- Create invoices table
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null,
  company_name text not null,
  amount decimal(10,2) not null,
  status public.invoice_status default 'pending' not null,
  file_path text not null,
  file_type text not null,
  extracted_data jsonb,
  employee_id uuid references public.employees not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reimbursements table
create table public.reimbursements (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices not null,
  employee_id uuid references public.employees not null,
  amount decimal(10,2) not null,
  status public.reimbursement_status default 'pending' not null,
  description text,
  approved_by uuid references auth.users,
  approved_at timestamp with time zone,
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create batch_payments table for grouping reimbursements
create table public.batch_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies not null,
  total_amount decimal(10,2) not null,
  stripe_invoice_id text,
  status text not null default 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create batch_payment_items table
create table public.batch_payment_items (
  id uuid primary key default gen_random_uuid(),
  batch_payment_id uuid references public.batch_payments not null,
  reimbursement_id uuid references public.reimbursements not null,
  amount decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.invoices enable row level security;
alter table public.reimbursements enable row level security;
alter table public.batch_payments enable row level security;
alter table public.batch_payment_items enable row level security;

-- Companies policies
create policy "Companies are viewable by company employees"
  on public.companies for select
  using (
    exists (
      select 1 from public.employees
      where employees.company_id = companies.id
      and employees.user_id = auth.uid()
    )
  );

-- Employees policies
create policy "Employees can view their own company's employees"
  on public.employees for select
  using (
    exists (
      select 1 from public.employees as e
      where e.company_id = employees.company_id
      and e.user_id = auth.uid()
    )
  );

-- Invoices policies
create policy "Employees can view their own invoices"
  on public.invoices for select
  using (employee_id in (
    select id from public.employees
    where user_id = auth.uid()
  ));

create policy "Employees can create their own invoices"
  on public.invoices for insert
  with check (employee_id in (
    select id from public.employees
    where user_id = auth.uid()
  ));

-- Reimbursements policies
create policy "Employees can view their own reimbursements"
  on public.reimbursements for select
  using (employee_id in (
    select id from public.employees
    where user_id = auth.uid()
  ));

-- Functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
  before update on public.companies
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.employees
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.reimbursements
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.batch_payments
  for each row
  execute function public.handle_updated_at(); 