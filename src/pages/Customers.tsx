
import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomerEditDialog from '@/components/customers/CustomerEditDialog';
import CustomerOrdersDialog from '@/components/customers/CustomerOrdersDialog';
import { useCustomers, Customer } from '@/hooks/useCustomers';

const Customers = () => {
  const { customers, loading, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingOrders, setViewingOrders] = useState<Customer | null>(null);

  // Filter customers based on search term - now includes mobile number
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.mobile.includes(searchTerm)
  );

  const handleDeleteCustomer = async (customerId: string) => {
    await deleteCustomer(customerId);
  };

  const handleEditCustomer = async (updatedCustomer: Customer) => {
    // Convert Customer to the format expected by updateCustomer
    const customerUpdate = {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      mobile: updatedCustomer.mobile,
      address: updatedCustomer.address,
      pincode: updatedCustomer.pincode
    };
    
    const result = await updateCustomer(updatedCustomer.id, customerUpdate);
    if (result.success) {
      setEditingCustomer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Management</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Badge variant="secondary" className="text-sm md:text-base px-3 py-1.5 w-fit">
                {customers.length} Total Customers
              </Badge>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <Card className="border shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Registered Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">
                  {searchTerm ? 'No customers found matching your search' : 'No customers registered yet'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Customers who register through the customer portal will appear here'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[120px] font-semibold">Name</TableHead>
                      <TableHead className="min-w-[150px] font-semibold">Email</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Mobile</TableHead>
                      <TableHead className="min-w-[150px] font-semibold">Address</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Date Registered</TableHead>
                      <TableHead className="min-w-[120px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium">
                          <div className="max-w-[120px] truncate" title={customer.name}>
                            {customer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={customer.email || 'Not provided'}>
                            {customer.email || 'Not provided'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{customer.mobile}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={customer.address || 'Not provided'}>
                            {customer.address || 'Not provided'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(customer.date_joined || new Date()).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingOrders(customer)}
                              title="View Orders"
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCustomer(customer)}
                              title="Edit Customer"
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              title="Delete Customer"
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <CustomerEditDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={handleEditCustomer}
        />
      )}

      {/* View Orders Dialog */}
      {viewingOrders && (
        <CustomerOrdersDialog
          customer={viewingOrders}
          open={!!viewingOrders}
          onClose={() => setViewingOrders(null)}
        />
      )}
    </div>
  );
};

export default Customers;
