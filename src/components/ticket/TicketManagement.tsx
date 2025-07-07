
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Eye, MessageSquare, CheckCircle, Building } from 'lucide-react';
import { Ticket } from '@/utils/types';
import TicketDialog from './TicketDialog';

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
  loading 
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch = ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    onUpdateTicket(ticketId, { status: newStatus });
  };

  const handleAssignToMe = (ticketId: string) => {
    onUpdateTicket(ticketId, { assigned_to: 'Current User', status: 'in-review' });
  };

  const handleResolveTicket = (ticketId: string, resolution: string) => {
    onUpdateTicket(ticketId, { 
      status: 'closed', 
      resolution: resolution 
    });
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-review':
        return 'In Review';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const getUserTypeColor = (userType: string) => {
    return userType === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No tickets found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">#{ticket.id.slice(0, 8)}</CardTitle>
                      <Badge className={getUserTypeColor(ticket.user_type)}>
                        {ticket.user_type}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{ticket.user_name}</span> • {ticket.user_contact}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onAssignToBranch && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignToBranch(ticket.id, ticket.branch_id)}
                      >
                        <Building className="h-4 w-4 mr-1" />
                        Assign Branch
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Message:</p>
                    <p className="text-sm line-clamp-2">{ticket.message}</p>
                  </div>
                  
                  {ticket.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAssignToMe(ticket.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Assign to Me
                      </Button>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleStatusChange(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-review">In Review</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {ticket.status === 'in-review' && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter resolution details..."
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            const target = e.target as HTMLTextAreaElement;
                            if (target.value.trim()) {
                              handleResolveTicket(ticket.id, target.value.trim());
                            }
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const textarea = document.querySelector(`textarea[placeholder="Enter resolution details..."]`) as HTMLTextAreaElement;
                            if (textarea?.value.trim()) {
                              handleResolveTicket(ticket.id, textarea.value.trim());
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Resolve
                        </Button>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => handleStatusChange(ticket.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-review">In Review</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {ticket.status === 'closed' && ticket.resolution && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                      <p className="text-sm text-green-700">{ticket.resolution}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <TicketDialog
        ticket={selectedTicket}
        isOpen={isTicketDialogOpen}
        onClose={() => {
          setIsTicketDialogOpen(false);
          setSelectedTicket(null);
        }}
        onUpdateTicket={onUpdateTicket}
      />
    </div>
  );
};

export default TicketManagement;
