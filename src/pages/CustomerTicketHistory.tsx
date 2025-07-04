
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MessageSquare, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, LogOut, Ticket, ShoppingCart, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useTickets } from '@/hooks/useTickets';
import TicketDialog from '@/components/ticket/TicketDialog';
import { useCart } from '@/contexts/CartContext';

const CustomerTicketHistory = () => {
  const navigate = useNavigate();
  const {
    tickets,
    loading,
    fetchTickets
  } = useTickets();
  const [customer, setCustomer] = useState<any>(null);
  const {
    totalItems,
    setIsCartOpen
  } = useCart();

  useEffect(() => {
    const currentCustomer = localStorage.getItem('currentCustomer');
    if (currentCustomer) {
      setCustomer(JSON.parse(currentCustomer));
    } else {
      navigate('/customer-login');
    }
  }, [navigate]);

  // Filter tickets for the current customer
  const customerTickets = tickets.filter(ticket => customer && ticket.user_id === customer.id);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleTicketCreated = () => {
    fetchTickets();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentCustomer');
    setCustomer(null);
    navigate('/customer-login');
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/customer-home')}>
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">Dostan Mart</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{customer.name}</span>
            
            {/* Cart Icon */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[1.25rem] h-5 flex items-center justify-center text-xs rounded-full px-1">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.profile_photo} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/customer-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-tickets')}>
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>Support Tickets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/customer-orders')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/customer-home')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  My Support Tickets
                </h1>
                <p className="text-muted-foreground">
                  View and manage your support requests
                </p>
              </div>
            </div>
            
            <TicketDialog
              userType="customer"
              userId={customer?.id}
              userName={customer?.name}
              userContact={customer?.mobile}
              onSubmit={handleTicketCreated}
              buttonText="Raise a Ticket"
            />
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading tickets...</div>
            </div>
          ) : customerTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">You haven't raised any support tickets yet.</h3>
                <p className="text-muted-foreground mb-4">
                  Need help? Create your first support ticket and we'll get back to you soon.
                </p>
                <TicketDialog
                  userType="customer"
                  userId={customer?.id}
                  userName={customer?.name}
                  userContact={customer?.mobile}
                  onSubmit={handleTicketCreated}
                  buttonText="Raise Your First Ticket"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {customerTickets.map(ticket => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Ticket #{ticket.id.slice(-8)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created on {format(new Date(ticket.created_at), 'PPP')}
                          </span>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(ticket.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Message:
                        </p>
                        <p className="text-sm">{ticket.message}</p>
                      </div>
                      
                      {ticket.resolution && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Resolution:
                          </p>
                          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            {ticket.resolution}
                          </p>
                        </div>
                      )}
                      
                      {ticket.assigned_to && (
                        <div className="text-xs text-muted-foreground">
                          Assigned to: {ticket.assigned_to}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTicketHistory;
