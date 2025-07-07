
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Receipt, Eye, Building2, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import TransactionDetailsDialog from './TransactionDetailsDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { useBranchName } from '@/hooks/useBranchName';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface TransactionItem {
  id: string;
  customer_name: string;
  customer_mobile: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  coupon_used?: string;
  branch_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionHistoryProps {
  transactions?: TransactionItem[];
  dailyEarnings?: any[];
  monthlyEarnings?: any[];
  products?: any[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions: propTransactions = [],
  dailyEarnings = [],
  monthlyEarnings = [],
  products = []
}) => {
  const { transactions: hookTransactions, loading } = useTransactions();
  const { getBranchName } = useBranchName();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Use prop transactions if provided, otherwise use hook transactions
  const transactions = propTransactions.length > 0 ? propTransactions : hookTransactions;

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.customer_mobile.includes(searchTerm) ||
                           transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesDate = !dateFilter || 
                         format(new Date(transaction.created_at), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateFilter]);

  const handleViewTransaction = (transaction: TransactionItem) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const csvData = filteredTransactions.map(transaction => {
      const itemNames = Array.isArray(transaction.items) 
        ? transaction.items.map(item => `${item.name} (${item.quantity})`).join('; ')
        : '';
      
      return {
        'Transaction ID': transaction.id,
        'Date': format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm'),
        'Customer Name': transaction.customer_name,
        'Customer Mobile': transaction.customer_mobile,
        'Branch': getBranchName(transaction.branch_id),
        'Payment Method': transaction.payment_method,
        'Total Amount': `₹${Number(transaction.total).toFixed(2)}`,
        'Created By': transaction.created_by || 'System',
        'Items Count': Array.isArray(transaction.items) ? transaction.items.length : 0,
        'Items Details': itemNames
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold">Transaction History</CardTitle>
            </div>
            <Button onClick={handleExportTransactions} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by customer name, mobile, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40 justify-start text-left">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDateFilter(undefined)}
                      className="w-full"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No transactions found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        #{transaction.id.slice(-8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.customer_name}
                      </TableCell>
                      <TableCell>{transaction.customer_mobile}</TableCell>
                      <TableCell>{getBranchName(transaction.branch_id)}</TableCell>
                      <TableCell className="font-medium">
                        ₹{Number(transaction.total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        transaction={selectedTransaction as any}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
};

export default TransactionHistory;
