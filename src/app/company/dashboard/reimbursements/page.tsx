'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiClock, FiDollarSign, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

interface ReimbursementRequest {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  receipt_url?: string;
  created_at: string;
  approved_at?: string;
  admin_notes?: string;
  profiles?: {
    full_name: string;
    email: string;
    department: string;
    phone?: string;
  };
}

export default function CompanyReimbursementsPage() {
  const [requests, setRequests] = useState<ReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ReimbursementRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [companyAuth, setCompanyAuth] = useState<any>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

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
      fetchReimbursements();
    }
  }, [companyAuth]);

  useEffect(() => {
    // Calculate stats whenever requests change
    const newStats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      totalAmount: requests.reduce((sum, r) => sum + r.amount, 0)
    };
    setStats(newStats);
  }, [requests]);

  const fetchReimbursements = async () => {
    try {
      if (!companyAuth?.id) {
        console.error('No company ID available');
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/company/reimbursements?companyId=${companyAuth.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.reimbursements || []);
      } else {
        console.error('Failed to fetch reimbursements');
      }
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      
      const response = await fetch('/api/company/reimbursements/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reimbursementId: selectedRequest.id,
          action,
          notes: actionNotes
        }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id ? updatedRequest : req
        ));
        
        setShowModal(false);
        setSelectedRequest(null);
        setProcessingAction(null);
        setActionNotes('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error ${action}ing request. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (request: ReimbursementRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setProcessingAction(action);
    setShowModal(true);
    setActionNotes('');
  };

  const filteredRequests = requests.filter(request => {
    const employeeName = request.profiles?.full_name || '';
    const employeeEmail = request.profiles?.email || '';
    
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employeeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'approved':
        return <FiCheck className="w-4 h-4" />;
      case 'rejected':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'approved':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'rejected':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#F3F4F6] dark:bg-[#333333] rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-[#F3F4F6] dark:bg-[#333333] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Reimbursement Management</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Review and process employee reimbursement requests
          </p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200">
          <FiDownload className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {stats.pending}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {stats.approved}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {stats.rejected}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Rejected</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {formatCurrency(stats.totalAmount)}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by employee, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-80 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <FiFilter className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reimbursement Requests */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FiDollarSign className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
              No Reimbursements Found
            </h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              {searchTerm || statusFilter !== 'all' 
                ? 'No reimbursements match your current filters'
                : 'No reimbursement requests have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB] dark:divide-[#333333]">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-[#F8F9FA] dark:hover:bg-[#333333] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Employee Info */}
                    <div className="bg-[#F3F4F6] dark:bg-[#555555] rounded-full p-3">
                      <FiUser className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                            {request.profiles?.full_name || 'Unknown Employee'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                            <div className="flex items-center space-x-1">
                              <FiMail className="w-4 h-4" />
                              <span>{request.profiles?.email || 'No email'}</span>
                            </div>
                            {request.profiles?.department && (
                              <div className="flex items-center space-x-1">
                                <FiMapPin className="w-4 h-4" />
                                <span>{request.profiles.department}</span>
                              </div>
                            )}
                            {request.profiles?.phone && (
                              <div className="flex items-center space-x-1">
                                <FiPhone className="w-4 h-4" />
                                <span>{request.profiles.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#1F2937] dark:text-white">
                            {formatCurrency(request.amount)}
                          </div>
                          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            {request.category}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#F8F9FA] dark:bg-[#555555] rounded-lg p-4 mb-3">
                        <p className="text-[#1F2937] dark:text-white text-sm">
                          {request.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                          
                          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            Submitted {formatDate(request.created_at)}
                          </div>
                          
                          {request.approved_at && (
                            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                              Processed {formatDate(request.approved_at)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white border border-[#E5E7EB] dark:border-[#555555] rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#555555] transition-colors"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(request, 'approve')}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              >
                                <FiCheck className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                onClick={() => openActionModal(request, 'reject')}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {request.admin_notes && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && processingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-4">
              {processingAction === 'approve' ? 'Approve' : 'Reject'} Reimbursement
            </h3>
            
            <div className="mb-4">
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                Employee: <span className="font-medium">{selectedRequest.profiles?.full_name}</span>
              </p>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                Amount: <span className="font-medium">{formatCurrency(selectedRequest.amount)}</span>
              </p>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                Category: <span className="font-medium">{selectedRequest.category}</span>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">
                {processingAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={processingAction === 'approve' 
                  ? 'Add any notes about the approval...' 
                  : 'Please provide a reason for rejection...'
                }
                rows={3}
                className="w-full rounded-lg border border-[#E5E7EB] dark:border-[#333333] bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white px-3 py-2 focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(processingAction)}
                disabled={actionLoading || (processingAction === 'reject' && !actionNotes.trim())}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  processingAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Processing...' : (processingAction === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 