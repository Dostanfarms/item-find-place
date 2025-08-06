
-- Update employees table to support multiple branch assignments
ALTER TABLE employees DROP COLUMN branch_id;

-- Create a junction table for employee-branch relationships
CREATE TABLE IF NOT EXISTS employee_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(employee_id, branch_id)
);

-- Enable RLS on the new table
ALTER TABLE employee_branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for employee_branches
CREATE POLICY "Allow all operations on employee_branches" ON employee_branches FOR ALL USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_branches_employee_id ON employee_branches(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_branches_branch_id ON employee_branches(branch_id);
