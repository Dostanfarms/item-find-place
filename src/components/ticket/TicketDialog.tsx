
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X } from 'lucide-react';
import { Ticket } from '@/utils/types';

interface TicketDialogProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updatedData: any) => void;
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket
}) => {
  const [resolution, setResolution] = React.useState('');

  if (!ticket) return null;

  const handleResolve = () => {
    if (resolution.trim()) {
      onUpdateTicket(ticket.id, {
        status: 'closed',
        resolution: resolution.trim()
      });
      setResolution('');
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in-review':
        return 'bg-blue-500';
      case 'closed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUserTypeColor = (userType: string) => {
    return userType === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket #{ticket.id.slice(0, 8)}
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">User</label>
              <div className="flex items-center gap-2">
                <span>{ticket.user_name}</span>
                <Badge className={getUserTypeColor(ticket.user_type)}>
                  {ticket.user_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contact</label>
              <p>{ticket.user_contact}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <p className="bg-gray-50 p-3 rounded-md text-sm">{ticket.message}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Created</label>
            <p className="text-sm text-gray-600">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          {ticket.assigned_to && (
            <div>
              <label className="text-sm font-medium text-gray-700">Assigned To</label>
              <p className="text-sm">{ticket.assigned_to}</p>
            </div>
          )}

          {ticket.resolution && (
            <div>
              <label className="text-sm font-medium text-gray-700">Resolution</label>
              <p className="bg-green-50 p-3 rounded-md text-sm text-green-800">
                {ticket.resolution}
              </p>
            </div>
          )}

          {ticket.status === 'in-review' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Resolution</label>
              <Textarea
                placeholder="Enter resolution details..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleResolve} className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Resolve Ticket
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
