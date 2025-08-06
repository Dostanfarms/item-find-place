import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTransactions } from '@/hooks/useTransactions';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const Transactions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { transactions, loading } = useTransactions(selectedEmployee, startDate, endDate);
  const { employees } = useEmployees();
  const { currentUser } = useAuth();

  const getEmployeeDisplayName = (employee: Employee) => {
    if (employee.branchIds && employee.branchIds.length > 0) {
      const branchNames = employee.branches?.map(b => b.branch_name).join(', ') || 'Multiple Branches';
      return `${employee.name} (${branchNames})`;
    }
    return `${employee.name} (No Branch)`;
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Employee</label>
              <Select value={selectedEmployee || 'all'} onValueChange={(value) => setSelectedEmployee(value === 'all' ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {getEmployeeDisplayName(employee)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">Start Date</label>
              <input
                type="date"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">End Date</label>
              <input
                type="date"
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {loading ? (
              <div className="text-center py-4">Loading transactions...</div>
            ) : transactions && transactions.length > 0 ? (
              <ScrollArea>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">ID</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Type</th>
                      <th scope="col" className="px-6 py-3">Amount</th>
                      <th scope="col" className="px-6 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">{transaction.id}</td>
                        <td className="px-6 py-4">{format(new Date(transaction.date), 'yyyy-MM-dd')}</td>
                        <td className="px-6 py-4">{transaction.type}</td>
                        <td className="px-6 py-4">{transaction.amount}</td>
                        <td className="px-6 py-4">{transaction.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            ) : (
              <div className="text-center py-4">No transactions found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
