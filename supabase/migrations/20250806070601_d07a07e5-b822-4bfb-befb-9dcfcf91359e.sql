
-- Add branch_id column back to employees table for backward compatibility
ALTER TABLE employees ADD COLUMN branch_id uuid REFERENCES branches(id);

-- Create employee_branches junction table for many-to-many relationship
CREATE TABLE employee_branches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(employee_id, branch_id)
);

-- Enable RLS on employee_branches table
ALTER TABLE employee_branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for employee_branches
CREATE POLICY "Allow all operations on employee_branches" ON employee_branches
FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX idx_employee_branches_employee_id ON employee_branches(employee_id);
CREATE INDEX idx_employee_branches_branch_id ON employee_branches(branch_id);
