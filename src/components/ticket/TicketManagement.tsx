
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, Ticket as TicketIcon, UserCheck, Building } from 'lucide-react';
import { Ticket } from '@/utils/types';
import EnhancedTicketDialog from './EnhancedTicketDialog';
import { format } from 'date-fns';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);
  };

  const handleCloseDialog = () => {
    setShowTicketDialog(false);
    setSelectedTicket(null);
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_contact.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUserType = userTypeFilter === 'all' || ticket.user_type === userTypeFilter;
    
    return matchesSearch && matchesStatus && matchesUserType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-review':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType: string) => {
    return userType === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getPriorityByStatus = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'in-review': return 2;
      case 'closed': return 3;
      default: return 4;
    }
  };

  // Sort tickets by priority (pending first, then in-review, then closed)
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityA = getPriorityByStatus(a.status);
    const priorityB = getPriorityByStatus(b.status);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TicketIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'in-review').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name, message, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="farmer">Farmers</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono">
                      #{ticket.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ticket.user_name}</span>
                        <Badge className={getUserTypeColor(ticket.user_type)}>
                          {ticket.user_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.user_contact}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={ticket.message}>
                        {ticket.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onAssignToBranch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssignToBranch(ticket.id, (ticket as any).branch_id)}
                            title="Assign to Branch"
                          >
                            <Building className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Ticket Dialog */}
      <EnhancedTicketDialog
        ticket={selectedTicket}
        isOpen={showTicketDialog}
        onClose={handleCloseDialog}
        onUpdateTicket={onUpdateTicket}
      />
    </div>
  );
};

export default TicketManagement;
