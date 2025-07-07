
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, X, Send, Paperclip, Calendar, User, Phone, MessageSquare } from 'lucide-react';
import { Ticket } from '@/utils/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface TicketReply {
  id: string;
  ticket_id: string;
  replied_by: string;
  reply_message: string;
  attachment_url?: string;
  created_at: string;
}

interface EnhancedTicketDialogProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (ticketId: string, updatedData: any) => void;
}

const EnhancedTicketDialog: React.FC<EnhancedTicketDialogProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (ticket && isOpen) {
      setNewStatus(ticket.status);
      fetchReplies();
    }
  }, [ticket, isOpen]);

  const fetchReplies = async () => {
    if (!ticket) return;
    
    setRepliesLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error",
        description: "Failed to load ticket replies",
        variant: "destructive"
      });
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket || newStatus === ticket.status) return;
    
    setLoading(true);
    try {
      await onUpdateTicket(ticket.id, { status: newStatus });
      toast({
        title: "Success",
        description: "Ticket status updated successfully"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `ticket-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  };

  const handleSendReply = async () => {
    if (!ticket || !replyMessage.trim()) return;

    setLoading(true);
    try {
      let attachmentUrl = null;
      
      if (attachment) {
        attachmentUrl = await uploadAttachment(attachment);
        if (!attachmentUrl) {
          toast({
            title: "Warning",
            description: "Failed to upload attachment, but reply will be sent"
          });
        }
      }

      const { error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: ticket.id,
          replied_by: currentUser?.name || 'Admin',
          reply_message: replyMessage.trim(),
          attachment_url: attachmentUrl
        });

      if (error) throw error;

      // Update ticket status to 'in-review' if it was pending
      if (ticket.status === 'pending') {
        await onUpdateTicket(ticket.id, { status: 'in-review' });
      }

      setReplyMessage('');
      setAttachment(null);
      await fetchReplies();
      
      toast({
        title: "Success",
        description: "Reply sent successfully"
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

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

  const getFileTypeIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return '🖼️';
    } else if (['pdf'].includes(ext || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(ext || '')) {
      return '📝';
    }
    return '📎';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket #{ticket.id.slice(0, 8)}
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Ticket Details - Left Side */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User Details
                </label>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ticket.user_name}</span>
                    <Badge className={getUserTypeColor(ticket.user_type)}>
                      {ticket.user_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Phone className="h-3 w-3" />
                    {ticket.user_contact}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Original Message
                </label>
                <div className="mt-1 bg-gray-50 p-3 rounded-md text-sm">
                  {ticket.message}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {ticket.assigned_to && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="text-sm mt-1">{ticket.assigned_to}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Update Status</label>
                <div className="flex gap-2 mt-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={loading || newStatus === ticket.status}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Replies and New Reply - Right Side */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 flex flex-col">
              <h3 className="font-medium mb-3">Conversation</h3>
              
              <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
                {repliesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading replies...
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No replies yet. Start the conversation below.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{reply.replied_by}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(reply.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{reply.reply_message}</p>
                        {reply.attachment_url && (
                          <div className="mt-2">
                            <a 
                              href={reply.attachment_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {getFileTypeIcon(reply.attachment_url)} Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* New Reply Section */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                />
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="attachment"
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="attachment" className="cursor-pointer">
                    <Button variant="outline" size="sm" type="button">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach File
                    </Button>
                  </label>
                  {attachment && (
                    <span className="text-sm text-gray-600">
                      {attachment.name}
                    </span>
                  )}
                  
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                    <Button 
                      onClick={handleSendReply}
                      disabled={loading || !replyMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {loading ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedTicketDialog;
