'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEye, FiMail, FiDollarSign, FiTrendingUp, FiCalendar, FiActivity } from 'react-icons/fi';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  totalReimbursements: number;
  approvedAmount: number;
  pendingAmount: number;
  reimbursementCount: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

export default function CompanyEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [companyAuth, setCompanyAuth] = useState<any>(null);

  useEffect(() => {
    // Get company auth data
    const authData = localStorage.getItem('companyAuth');
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        setCompanyAuth(parsedAuth);
      } catch (error) {
        console.error('Error parsing company auth data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (companyAuth?.id) {
      fetchEmployees();
    }
  }, [companyAuth]);

  const fetchEmployees = async () => {
    try {
      if (!companyAuth?.id) {
        console.error('No company ID available');
        return;
      }

      setLoading(true);
      
      const response = await fetch(`/api/company/employees?companyId=${companyAuth.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      
      // Transform API data to match our Employee interface
      const transformedEmployees: Employee[] = data.employees.map((emp: any) => ({
        id: emp.id,
        name: emp.name || 'Unknown',
        email: emp.contact?.email || emp.email || '',
        department: emp.department || 'General',
        position: emp.department || 'Employee', // Using department as position for now
        joinDate: emp.joinDate,
        totalReimbursements: emp.statistics?.totalAmount || 0,
        approvedAmount: emp.statistics?.approvedCount || 0,
        pendingAmount: emp.statistics?.pendingCount || 0,
        reimbursementCount: emp.statistics?.totalReimbursements || 0,
        lastActivity: emp.lastActivity,
        status: 'active' // All employees from API are considered active
      }));
      
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = ['all', ...new Set(employees.map(emp => emp.department))];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastActivity = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-[#F3F4F6] dark:bg-[#333333] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Employee Management</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Manage employee data and monitor reimbursement activity
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200">
            <FiDownload className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiActivity className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {employees.filter(e => e.status === 'active').length}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Active Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {formatCurrency(employees.reduce((sum, e) => sum + e.totalReimbursements, 0))}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Reimbursements</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiTrendingUp className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {formatCurrency(employees.reduce((sum, e) => sum + e.totalReimbursements, 0) / employees.length)}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Avg per Employee</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiCalendar className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {employees.reduce((sum, e) => sum + e.reimbursementCount, 0)}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
              />
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E7EB] dark:divide-[#333333]">
            <thead className="bg-[#F8F9FA] dark:bg-[#333333]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Total Reimbursements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Pending Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Requests Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1a1a1a] divide-y divide-[#E5E7EB] dark:divide-[#333333]">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#333333]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                        {employee.name}
                      </div>
                      <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {employee.email}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {employee.position}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] dark:bg-[#555555] text-[#6B7280] dark:text-[#9CA3AF]">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                      {formatCurrency(employee.totalReimbursements)}
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      Approved: {formatCurrency(employee.approvedAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                      {formatCurrency(employee.pendingAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#1F2937] dark:text-white">
                      {employee.reimbursementCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {formatLastActivity(employee.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'active' 
                        ? 'bg-[#F3F4F6] dark:bg-[#555555] text-[#1F2937] dark:text-white'
                        : 'bg-[#F3F4F6] dark:bg-[#555555] text-[#6B7280] dark:text-[#9CA3AF]'
                    }`}>
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowModal(true);
                        }}
                        className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white"
                      >
                        <FiMail className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                Employee Details
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Name
                  </label>
                  <p className="text-[#1F2937] dark:text-white font-medium">{selectedEmployee.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Email
                  </label>
                  <p className="text-[#1F2937] dark:text-white">{selectedEmployee.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Department
                  </label>
                  <p className="text-[#1F2937] dark:text-white">{selectedEmployee.department}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Position
                  </label>
                  <p className="text-[#1F2937] dark:text-white">{selectedEmployee.position}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Join Date
                  </label>
                  <p className="text-[#1F2937] dark:text-white">{formatDate(selectedEmployee.joinDate)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEmployee.status === 'active' 
                      ? 'bg-[#F3F4F6] dark:bg-[#555555] text-[#1F2937] dark:text-white'
                      : 'bg-[#F3F4F6] dark:bg-[#555555] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                    {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-[#E5E7EB] dark:border-[#333333] pt-6">
                <h4 className="text-lg font-medium text-[#1F2937] dark:text-white mb-4">Reimbursement Summary</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Reimbursements</p>
                        <p className="text-xl font-bold text-[#1F2937] dark:text-white">
                          {formatCurrency(selectedEmployee.totalReimbursements)}
                        </p>
                      </div>
                      <FiDollarSign className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </div>
                  </div>
                  
                  <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Requests</p>
                        <p className="text-xl font-bold text-[#1F2937] dark:text-white">
                          {selectedEmployee.reimbursementCount}
                        </p>
                      </div>
                      <FiActivity className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </div>
                  </div>
                  
                  <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Approved Amount</p>
                        <p className="text-xl font-bold text-[#1F2937] dark:text-white">
                          {formatCurrency(selectedEmployee.approvedAmount)}
                        </p>
                      </div>
                      <FiTrendingUp className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </div>
                  </div>
                  
                  <div className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Pending Amount</p>
                        <p className="text-xl font-bold text-[#1F2937] dark:text-white">
                          {formatCurrency(selectedEmployee.pendingAmount)}
                        </p>
                      </div>
                      <FiCalendar className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-[#E5E7EB] dark:border-[#333333] flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200"
              >
                Close
              </button>
              
              <a
                href={`mailto:${selectedEmployee.email}`}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
              >
                <FiMail className="w-4 h-4" />
                <span>Contact Employee</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 