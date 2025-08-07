
-- Add branch_id column to employees table to support branch assignment
ALTER TABLE public.employees ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Create index for better performance on branch filtering
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);
