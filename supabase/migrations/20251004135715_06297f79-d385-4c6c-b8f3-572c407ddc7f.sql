-- Drop the existing foreign key constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_dish_id_fkey;

-- Add the constraint back with ON DELETE SET NULL
-- This will set dish_id to NULL in transactions when a dish is deleted
ALTER TABLE transactions
ADD CONSTRAINT transactions_dish_id_fkey 
FOREIGN KEY (dish_id) 
REFERENCES dishes(id) 
ON DELETE SET NULL;