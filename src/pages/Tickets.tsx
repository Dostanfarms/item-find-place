
import React, { useState } from 'react';
import TicketManagement from '@/components/ticket/TicketManagement';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import ProtectedAction from '@/components/ProtectedAction';
import BranchFilter from '@/components/BranchFilter';
import BranchAssignmentDialog from '@/components/BranchAssignmentDialog';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/AdminHeader';

const TicketsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPermission, currentUser, selectedBranch } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    ticketId: string;
    currentBranchId?: string | null;
  }>({ open: false, ticketId: '' });
  
  const { tickets, updateTicket, loading, fetchTickets } = useTickets();

  // Filter tickets based on selected branch for admin users
  const filteredTickets = React.useMemo(() => {
    if (currentUser?.role?.toLowerCase() === 'admin' && selectedBranch) {
      return tickets.filter(ticket => (ticket as any).branch_id === selectedBranch);
    }
    return tickets;
  }, [tickets, selectedBranch, currentUser]);

  const handleUpdateTicket = async (ticketId: string, updatedData: any) => {
    if (!hasPermission('tickets', 'edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit tickets",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating ticket from admin:', ticketId, updatedData);
    
    const result = await updateTicket(ticketId, updatedData);
    
    if (result.success) {
      toast({
        title: "Ticket Updated",
        description: `Ticket #${ticketId} has been updated successfully.`,
      });
    }
  };

  const handleAssignToBranch = (ticketId: string, currentBranchId?: string | null) => {
    setAssignmentDialog({
      open: true,
      ticketId,
      currentBranchId
    });
  };

  const handleAssignmentSuccess = () => {
    fetchTickets();
    setAssignmentDialog({ open: false, ticketId: '' });
  };

  // Check if user has permission to view tickets
  if (!hasPermission('tickets', 'view')) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Ticket Management</h1>
          <div className="ml-auto">
            <BranchFilter />
          </div>
        </div>
        
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
                  <span className="text-lg font-bold">AgriPay Admin</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-auto"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center justify-start gap-2"
                  onClick={() => {
                    navigate(-1);
                    setMenuOpen(false);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <ProtectedAction resource="tickets" action="view">
            <TicketManagement 
              tickets={filteredTickets} 
              onUpdateTicket={handleUpdateTicket}
              onAssignToBranch={currentUser?.role?.toLowerCase() === 'admin' ? handleAssignToBranch : undefined}
              loading={loading}
            />
          </ProtectedAction>
        </ScrollArea>

        {/* Branch Assignment Dialog */}
        <BranchAssignmentDialog
          open={assignmentDialog.open}
          onClose={() => setAssignmentDialog({ open: false, ticketId: '' })}
          itemId={assignmentDialog.ticketId}
          itemType="ticket"
          currentBranchId={assignmentDialog.currentBranchId}
          onSuccess={handleAssignmentSuccess}
        />
      </div>
    </div>
  );
};

export default TicketsPage;
