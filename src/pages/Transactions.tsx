import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionDetailsDialog from '@/components/TransactionDetailsDialog';
import { Search, Receipt, Calendar as CalendarIcon, IndianRupee, User, Eye } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import ProtectedAction from '@/components/ProtectedAction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';

const Transactions = () => {
  const { transactions, loading } = useTransactions();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter by search, status, and selected date
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_mobile.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesDate = !selectedDate ||
      isSameDay(new Date(transaction.created_at), selectedDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, transaction) => sum + Number(transaction.total), 0);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500',
      refunded: 'bg-blue-500'
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewTransaction = (transaction: any) => {
    if (!hasPermission('transactions', 'view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view transaction details",
        variant: "destructive"
      });
      return;
    }
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  // Check if user has permission to view transactions
  if (!hasPermission('transactions', 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view transactions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-none flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all transactions</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer name, or mobile..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Date Picker for filtering */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Date filter</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <DatePickerCalendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => setSelectedDate(date ?? null)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                {selectedDate && (
                  <div className="flex justify-end px-4 pb-2">
                    <Button
                      variant="link"
                      className="text-xs text-muted-foreground p-0 h-auto min-h-0"
                      onClick={() => setSelectedDate(null)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <select
            className="px-3 py-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-green-600">
              {transactions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalAmount().toFixed(2)}</div>
            <p className="text-xs text-green-600">
              From {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{filteredTransactions.length > 0 ? (getTotalAmount() / filteredTransactions.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-green-600">
              Average value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No transactions found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterStatus !== 'all' 
                ? 'No transactions match your search criteria.' 
                : 'No transactions have been recorded yet.'}
            </p>
          </div>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[120px] font-semibold">Transaction ID</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Customer</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Mobile</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Items</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Amount</TableHead>
                      <TableHead className="min-w-[80px] font-semibold">Status</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Date</TableHead>
                      <TableHead className="min-w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium">
                          <div className="max-w-[120px] truncate font-mono text-sm" title={transaction.id}>
                            #{transaction.id.slice(0, 8)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[120px] truncate" title={transaction.customer_name}>
                            {transaction.customer_name}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {transaction.customer_mobile}
                        </TableCell>
                        <TableCell className="text-center">
                          {Array.isArray(transaction.items) ? transaction.items.length : 0}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-green-600">
                          ₹{Number(transaction.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <ProtectedAction resource="transactions" action="view">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTransaction(transaction)}
                              className="h-7 px-2"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </ProtectedAction>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transaction Details Dialog */}
      {hasPermission('transactions', 'view') && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </div>
  );
};

export default Transactions;
