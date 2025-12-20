-- Create table for temporary event registrations
CREATE TABLE public.temp_event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temp_event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration)
CREATE POLICY "Anyone can register"
ON public.temp_event_registrations
FOR INSERT
WITH CHECK (true);

-- Only admins can view registrations
CREATE POLICY "Admins can view registrations"
ON public.temp_event_registrations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.temp_event_registrations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));