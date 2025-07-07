
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, MessageSquare } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketDialogProps {
  userType: string;
  userId: string;
  userName: string;
  userContact: string;
  onSubmit?: () => void;
  buttonText?: string;
}

const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  userType,
  userId,
  userName,
  userContact,
  onSubmit,
  buttonText = "Raise a Ticket"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addTicket } = useTickets();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await addTicket({
        user_id: userId,
        user_name: userName,
        user_type: userType,
        user_contact: userContact,
        message: message.trim(),
        status: 'pending',
        assigned_to: null,
        resolution: null,
        attachment_url: null
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Your ticket has been submitted successfully!"
        });
        
        setMessage('');
        setIsOpen(false);
        
        if (onSubmit) {
          onSubmit();
        }
      } else {
        throw new Error(result.error?.message || 'Failed to submit ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Support Ticket
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
            <div className="text-sm text-muted-foreground mb-2">
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Contact:</strong> {userContact}</p>
              <p><strong>Type:</strong> {userType}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
