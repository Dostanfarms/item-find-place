
-- Add created_by field to transactions table to track which employee created each transaction
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add an index for better performance when filtering by created_by
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON public.transactions(created_by);
