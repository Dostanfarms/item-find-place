
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTickets } from '@/hooks/useTickets';
import { toast } from '@/hooks/use-toast';

interface TicketFormProps {
  userType: string;
  userId?: string;
  userName?: string;
  userContact?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({
  userType,
  userId,
  userName,
  userContact,
  onSubmit,
  onCancel
}) => {
  const { addTicket } = useTickets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    attachment: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    // Validation for required fields
    if (!userId || !userName || !userContact) {
      toast({
        title: "Error", 
        description: "Missing user information. Please try logging in again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting ticket with data:', {
        user_id: userId,
        user_name: userName,
        user_type: userType,
        user_contact: userContact,
        message: formData.message.trim(),
        status: 'pending',
        assigned_to: null,
        resolution: null,
        attachment_url: null
      });

      const result = await addTicket({
        user_id: userId,
        user_name: userName,
        user_type: userType,
        user_contact: userContact,
        message: formData.message.trim(),
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
        
        // Reset form
        setFormData({
          message: '',
          attachment: null
        });
        
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="user-info">Contact Information</Label>
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
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Describe your issue or question..."
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </div>
    </form>
  );
};

export default TicketForm;
