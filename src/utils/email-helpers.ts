import { supabase } from './supabase';

export interface UserWithCompany {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  companies?: {
    id: string;
    company_name: string;
    email: string;
  };
}

export interface CompanyData {
  id: string;
  company_name: string;
  email: string;
}

// Get user details with company information
export async function getUserWithCompany(userId: string): Promise<UserWithCompany | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        company_id,
        companies!profiles_company_id_fkey(
          id,
          company_name,
          email
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to get user with company:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching user with company:', error);
    return null;
  }
}

// Get company details by ID
export async function getCompanyById(companyId: string): Promise<CompanyData | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, email')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('❌ Failed to get company:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching company:', error);
    return null;
  }
}

// Get company details by user ID
export async function getCompanyByUserId(userId: string): Promise<CompanyData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        company_id,
        companies!profiles_company_id_fkey(
          id,
          company_name,
          email
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to get company by user ID:', error);
      return null;
    }

    return data?.companies || null;
  } catch (error) {
    console.error('❌ Error fetching company by user ID:', error);
    return null;
  }
}

// Get invoice details with user and company data
export async function getInvoiceWithDetails(invoiceId: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        profiles!invoices_user_id_fkey(
          id,
          email,
          full_name,
          company_id,
          companies!profiles_company_id_fkey(
            id,
            company_name,
            email
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error) {
      console.error('❌ Failed to get invoice with details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching invoice with details:', error);
    return null;
  }
}

// Get reimbursement details with user and company data
export async function getReimbursementWithDetails(reimbursementId: string) {
  try {
    const { data, error } = await supabase
      .from('reimbursements')
      .select(`
        *,
        profiles!reimbursements_user_id_fkey(
          id,
          email,
          full_name,
          company_id,
          companies!profiles_company_id_fkey(
            id,
            company_name,
            email
          )
        )
      `)
      .eq('id', reimbursementId)
      .single();

    if (error) {
      console.error('❌ Failed to get reimbursement with details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching reimbursement with details:', error);
    return null;
  }
}

// Get approvers for a company (for now, returns company admins)
export async function getCompanyApprovers(companyId: string) {
  try {
    // For now, we'll return the company email as the primary approver
    // This could be enhanced to have specific approver roles in the future
    const company = await getCompanyById(companyId);
    
    if (!company) {
      return [];
    }

    return [
      {
        name: `${company.company_name} Admin`,
        email: company.email,
        role: 'admin'
      }
    ];
  } catch (error) {
    console.error('❌ Error fetching company approvers:', error);
    return [];
  }
} 