'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter } from 'react-icons/fi';

interface Reimbursement {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  description: string;
}

export default function ReimbursementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Placeholder data - replace with actual API call
  const reimbursements: Reimbursement[] = [
    {
      id: '1',
      date: '2024-02-20',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      amount: 250,
      status: 'pending',
      description: 'Office supplies'
    },
    {
      id: '2',
      date: '2024-02-19',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      amount: 150,
      status: 'approved',
      description: 'Travel expenses'
    },
    {
      id: '3',
      date: '2024-02-18',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      amount: 350,
      status: 'rejected',
      description: 'Software subscription'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredReimbursements = reimbursements.filter(reimbursement => {
    const matchesSearch = 
      reimbursement.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || reimbursement.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reimbursements</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reimbursements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-4 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reimbursements Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-y dark:border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
            {filteredReimbursements.map((reimbursement) => (
              <tr key={reimbursement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(reimbursement.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{reimbursement.employeeName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{reimbursement.employeeId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {reimbursement.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${reimbursement.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reimbursement.status)}`}>
                    {reimbursement.status.charAt(0).toUpperCase() + reimbursement.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <FiEye className="w-5 h-5" />
                    </button>
                    {reimbursement.status === 'pending' && (
                      <>
                        <button className="text-green-400 hover:text-green-500">
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button className="text-red-400 hover:text-red-500">
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 