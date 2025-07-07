
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageSquare, Calendar, Clock, CheckCircle, AlertTriangle, MoreHorizontal, Eye, Building } from 'lucide-react';
import { format } from 'date-fns';
import TicketDialog from './TicketDialog';

interface Ticket {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  user_contact: string;
  message: string;
  status: string;
  assigned_to: string | null;
  resolution: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  branch_id?: string | null;
}

interface TicketManagementProps {
  tickets: Ticket[];
  onUpdateTicket: (ticketId: string, updatedData: any) => void;
  onAssignToBranch?: (ticketId: string, currentBranchId?: string | null) => void;
  loading?: boolean;
}

const TicketManagement: React.FC<TicketManagementProps> = ({
  tickets,
  onUpdateTicket,
  onAssignToBranch,
  loading = false
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  const handleTicketUpdate = (ticketId: string, updatedData: any) => {
    onUpdateTicket(ticketId, updatedData);
    setIsDialogOpen(false);
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter(ticket => 
    statusFilter === 'all' || ticket.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Support Tickets</h2>
          <Badge variant="outline">{filteredTickets.length}</Badge>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        Ticket #{ticket.id.slice(-8)}
                      </CardTitle>
                      <Badge className={getStatusColor(ticket.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </span>
                      <span>{ticket.user_type}: {ticket.user_name}</span>
                      <span>{ticket.user_contact}</span>
                    </div>
                  </div>
                  
                  {/* 3 Dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTicketClick(ticket)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      {onAssignToBranch && (
                        <DropdownMenuItem onClick={() => onAssignToBranch(ticket.id, ticket.branch_id)}>
                          <Building className="h-4 w-4 mr-2" />
                          Assign to Branch
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Message:
                    </p>
                    <p className="text-sm line-clamp-2">{ticket.message}</p>
                  </div>
                  
                  {ticket.resolution && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Resolution:
                      </p>
                      <p className="text-sm text-green-700 bg-green-50 p-2 rounded line-clamp-2">
                        {ticket.resolution}
                      </p>
                    </div>
                  )}
                  
                  {ticket.assigned_to && (
                    <div className="text-xs text-muted-foreground">
                      Assigned to: {ticket.assigned_to}
                    </div>
                  )}

                  {ticket.branch_id && (
                    <div className="text-xs text-muted-foreground">
                      Branch ID: {ticket.branch_id}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <TicketDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onUpdateTicket={handleTicketUpdate}
      />
    </div>
  );
};

export default TicketManagement;
