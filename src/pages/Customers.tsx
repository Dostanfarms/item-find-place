
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Eye, Edit, Trash2, Menu, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(customerId);
    }
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
      <div className="min-h-screen w-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex-none p-6 border-b bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Customer Management</h1>
                <p className="text-muted-foreground">Manage registered customers</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Badge variant="secondary" className="text-base px-4 py-2 w-fit">
                  {customers.length} Total Customers
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No customers found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'No customers match your search criteria.' : 'Customers who register through the customer portal will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">
                          {customer.name}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          ID: {customer.id.slice(0, 8)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{customer.email || 'Not provided'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span>{customer.mobile}</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="truncate" title={customer.address}>
                          {customer.address || 'Not provided'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {new Date(customer.date_joined || new Date()).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setViewingOrders(customer)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" /> Orders
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingCustomer(customer)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
