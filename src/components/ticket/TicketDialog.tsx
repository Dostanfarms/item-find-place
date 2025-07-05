
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import TicketForm from './TicketForm';
import { Plus } from 'lucide-react';

interface TicketDialogProps {
  userType: 'farmer' | 'customer';
  userId: string;
  userName: string;
  userContact: string;
  onSubmit: () => void;
  buttonText?: string;
}

const TicketDialog: React.FC<TicketDialogProps> = ({
  userType,
  userId,
  userName,
  userContact,
  onSubmit,
  buttonText = "Raise a Ticket"
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    onSubmit();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <TicketForm 
          userType={userType} 
          userId={userId} 
          userName={userName} 
          userContact={userContact} 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
