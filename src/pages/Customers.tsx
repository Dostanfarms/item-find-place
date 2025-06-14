
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomerEditDialog from '@/components/customers/CustomerEditDialog';
import CustomerOrdersDialog from '@/components/customers/CustomerOrdersDialog';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useCustomers, Customer } from '@/hooks/useCustomers';

const Customers = () => {
  const { customers, loading, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingOrders, setViewingOrders] = useState<Customer | null>(null);

  // Filter customers based on search term
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
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground text-lg">Loading customers...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Fixed Header - Desktop Only */}
          <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {customers.length} Total Customers
                  </Badge>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
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
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[20%] font-semibold">Name</TableHead>
                          <TableHead className="w-[20%] font-semibold">Email</TableHead>
                          <TableHead className="w-[15%] font-semibold">Mobile</TableHead>
                          <TableHead className="w-[25%] font-semibold">Address</TableHead>
                          <TableHead className="w-[12%] font-semibold">Date Registered</TableHead>
                          <TableHead className="text-right w-[8%] font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-gray-50 border-b">
                            <TableCell className="font-medium truncate" title={customer.name}>
                              {customer.name}
                            </TableCell>
                            <TableCell className="truncate" title={customer.email || 'Not provided'}>
                              {customer.email || 'Not provided'}
                            </TableCell>
                            <TableCell>{customer.mobile}</TableCell>
                            <TableCell className="truncate" title={customer.address || 'Not provided'}>
                              {customer.address || 'Not provided'}
                            </TableCell>
                            <TableCell>{new Date(customer.date_joined || new Date()).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingOrders(customer)}
                                  title="View Orders"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingCustomer(customer)}
                                  title="Edit Customer"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  title="Delete Customer"
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
    </SidebarProvider>
  );
};

export default Customers;
