
-- Create a ticket_replies table to store replies and attachments
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  replied_by TEXT NOT NULL,
  reply_message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ticket_replies
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Create policy for ticket_replies
CREATE POLICY "Allow all operations on ticket_replies" ON public.ticket_replies FOR ALL USING (true);

-- Add index for better performance
CREATE INDEX idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_created_at ON public.ticket_replies(created_at DESC);
