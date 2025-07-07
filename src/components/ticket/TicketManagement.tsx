
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, Building, MessageCircle, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import EnhancedTicketDialog from './EnhancedTicketDialog';
import CreateTicketDialog from './CreateTicketDialog';
import { useBranchName } from '@/hooks/useBranchName';
import { Ticket } from '@/hooks/useTickets';

interface TicketManagementProps {
  tickets: Ticket[];
  onUpdateTicket: (ticketId: string, updatedData: any) => void;
  onAssignToBranch?: (ticketId: string, currentBranchId?: string | null) => void;
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case 'customer': return 'bg-purple-100 text-purple-800';
    case 'farmer': return 'bg-green-100 text-green-800';
    case 'employee': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TicketManagement: React.FC<TicketManagementProps> = ({
  tickets,
  onUpdateTicket,
  onAssignToBranch,
  loading
}) => {
  const { getBranchName } = useBranchName();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.user_contact.includes(searchTerm) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesUserType = userTypeFilter === 'all' || ticket.user_type === userTypeFilter;
      
      return matchesSearch && matchesStatus && matchesUserType;
    });
  }, [tickets, searchTerm, statusFilter, userTypeFilter]);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleUpdateTicket = (updatedData: any) => {
    if (selectedTicket) {
      onUpdateTicket(selectedTicket.id, updatedData);
      setIsTicketDialogOpen(false);
    }
  };

  const handleAssignToBranch = (ticket: Ticket) => {
    if (onAssignToBranch) {
      onAssignToBranch(ticket.id, ticket.branch_id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold">Support Tickets</CardTitle>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create New Ticket
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tickets by name, contact, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
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
            
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="farmer">Farmers</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading tickets...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No tickets found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        #{ticket.id.slice(-8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ticket.user_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getUserTypeColor(ticket.user_type)}>
                          {ticket.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.user_contact}</TableCell>
                      <TableCell>{getBranchName(ticket.branch_id)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {onAssignToBranch && (
                              <DropdownMenuItem onClick={() => handleAssignToBranch(ticket)}>
                                <Building className="h-4 w-4 mr-2" />
                                Assign to Branch
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedTicketDialog
        ticket={selectedTicket}
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        onUpdateTicket={handleUpdateTicket}
      />

      <CreateTicketDialog
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
};

export default TicketManagement;
