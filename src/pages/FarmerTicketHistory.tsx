
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/hooks/useTickets';
import TicketDialog from '@/components/ticket/TicketDialog';
import { Package, ChevronLeft, LogOut, Menu } from 'lucide-react';

const FarmerTicketHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tickets, addTicket, loading } = useTickets();
  const [farmer, setFarmer] = useState<any>(null);
  const [farmerTickets, setFarmerTickets] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check if farmer is logged in
    const currentFarmerStr = localStorage.getItem('currentFarmer');
    if (!currentFarmerStr) {
      toast({
        title: "Authentication required",
        description: "Please login to access your tickets.",
        variant: "destructive"
      });
      navigate('/farmer-login');
      return;
    }

    const currentFarmer = JSON.parse(currentFarmerStr);
    if (currentFarmer.id !== id) {
      toast({
        title: "Access denied",
        description: "You do not have permission to access these tickets.",
        variant: "destructive"
      });
      navigate('/farmer-login');
      return;
    }
    
    // Set farmer data
    setFarmer(currentFarmer);
  }, [id, navigate, toast]);

  // Filter tickets for current farmer
  useEffect(() => {
    if (farmer && tickets.length >= 0) {
      const filteredTickets = tickets.filter(ticket => ticket.user_id === farmer.id);
      setFarmerTickets(filteredTickets);
    }
  }, [farmer, tickets]);

  const handleLogout = () => {
    localStorage.removeItem('currentFarmer');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/farmer-login');
  };
  
  const handleTicketSubmit = async (ticketData: {
    user_id: string;
    user_type: string;
    user_name: string;
    user_contact: string;
    message: string;
    status: string;
    attachment_url?: string;
  }) => {
    console.log('Submitting farmer ticket:', ticketData);
    const result = await addTicket(ticketData);
    
    if (result.success) {
      toast({
        title: "Ticket Submitted",
        description: "Your support ticket has been submitted.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>;
      case 'in-review':
        return <Badge variant="outline" className="bg-blue-100">In Review</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-100">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!farmer) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/farmer-dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold hidden sm:inline">DostanFarms</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{farmer.name}</p>
              <p className="text-sm text-muted-foreground">Farmer ID: {farmer.id}</p>
            </div>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b pb-4">
                <Package className="h-6 w-6 text-agri-primary" />
                <span className="text-lg font-bold">DostanFarms</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={() => setMenuOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-2"
                onClick={() => {
                  navigate('/farmer-dashboard');
                  setMenuOpen(false);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 justify-start mt-auto"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Support Tickets</h1>
          <TicketDialog
            userType="farmer"
            userId={farmer.id}
            userName={farmer.name}
            userContact={farmer.phone}
            onSubmit={handleTicketSubmit}
            buttonText="Raise a New Ticket"
          />
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <p className="text-muted-foreground">Loading tickets...</p>
            </CardContent>
          </Card>
        ) : farmerTickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground text-center mb-4">You haven't raised any support tickets yet.</p>
              <TicketDialog
                userType="farmer"
                userId={farmer.id}
                userName={farmer.name}
                userContact={farmer.phone}
                onSubmit={handleTicketSubmit}
                buttonText="Raise Your First Ticket"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {farmerTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket #{ticket.id}</p>
                      <CardTitle className="text-lg">{ticket.message.substring(0, 50)}{ticket.message.length > 50 ? '...' : ''}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(ticket.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{ticket.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span> {format(new Date(ticket.created_at), 'PPp')}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {format(new Date(ticket.updated_at), 'PPp')}
                    </div>
                    {ticket.assigned_to && (
                      <div>
                        <span className="font-medium">Assigned to:</span> {ticket.assigned_to}
                      </div>
                    )}
                  </div>
                  
                  {ticket.resolution && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium mb-2">Resolution:</p>
                      <p className="text-sm text-muted-foreground">{ticket.resolution}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerTicketHistory;
