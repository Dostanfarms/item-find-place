
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { useTickets, Ticket } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';

interface EnhancedTicketDialogProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket: (updatedData: any) => void;
}

const EnhancedTicketDialog: React.FC<EnhancedTicketDialogProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  const { addTicketReply } = useTickets();
  const { toast } = useToast();

  React.useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  const handleSendReply = async () => {
    if (!ticket || !replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Handle file attachment upload if needed
      const result = await addTicketReply({
        ticket_id: ticket.id,
        replied_by: 'Admin', // You might want to get this from auth context
        reply_message: replyMessage.trim(),
        attachment_url: null // TODO: Implement file upload
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Reply sent successfully!"
        });
        setReplyMessage('');
        setAttachmentFile(null);
      } else {
        throw new Error(result.error?.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (ticket && newStatus !== ticket.status) {
      onUpdateTicket({ status: newStatus });
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      // TODO: Implement file upload functionality
      toast({
        title: "File attached",
        description: `${file.name} will be uploaded with your reply`
      });
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ticket #{ticket.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">From:</span> {ticket.user_name}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {ticket.user_contact}
              </div>
              <div>
                <span className="font-medium">Type:</span> {ticket.user_type}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-3">
              <span className="font-medium">Message:</span>
              <p className="mt-1 text-gray-700">{ticket.message}</p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <Label htmlFor="status">Update Status</Label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reply Section */}
          <div>
            <Label htmlFor="reply">Type your message</Label>
            <Textarea
              id="reply"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              className="min-h-[100px] mt-2"
            />
          </div>

          {/* File Attachment */}
          <div>
            <Label htmlFor="attachment" className="flex items-center gap-2 cursor-pointer">
              <Paperclip className="h-4 w-4" />
              Attach File
            </Label>
            <input
              id="attachment"
              type="file"
              onChange={handleFileAttachment}
              className="mt-2"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            {attachmentFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {attachmentFile.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleSendReply} 
              disabled={loading || !replyMessage.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedTicketDialog;
