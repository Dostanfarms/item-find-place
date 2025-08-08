
-- Update the employees table to better support multi-branch functionality
-- Keep the branch_id for primary branch compatibility, but rely more on employee_branches table

-- Add indexes for better performance on employee_branches
CREATE INDEX IF NOT EXISTS idx_employee_branches_employee_id ON employee_branches(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_branches_branch_id ON employee_branches(branch_id);

-- Add a function to get employee branch IDs
CREATE OR REPLACE FUNCTION get_employee_branches(emp_id UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT branch_id 
        FROM employee_branches 
        WHERE employee_id = emp_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing data to ensure consistency
-- For employees who have a branch_id but no employee_branches record, create one
INSERT INTO employee_branches (employee_id, branch_id)
SELECT id, branch_id 
FROM employees 
WHERE branch_id IS NOT NULL 
AND id NOT IN (SELECT employee_id FROM employee_branches WHERE branch_id = employees.branch_id)
ON CONFLICT DO NOTHING;
