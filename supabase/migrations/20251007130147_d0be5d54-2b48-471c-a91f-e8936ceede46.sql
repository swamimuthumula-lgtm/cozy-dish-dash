-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can insert workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can update workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON public.workers;

-- Create public access policies (client-side auth will control UI)
CREATE POLICY "Anyone can view workers" 
ON public.workers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert workers" 
ON public.workers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update workers" 
ON public.workers 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete workers" 
ON public.workers 
FOR DELETE 
USING (true);