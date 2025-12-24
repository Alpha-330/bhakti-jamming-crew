-- Add booking code and check-in tracking to temp_event_registrations
ALTER TABLE public.temp_event_registrations 
ADD COLUMN booking_code TEXT UNIQUE DEFAULT NULL,
ADD COLUMN checked_in BOOLEAN DEFAULT false,
ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to generate unique booking code
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.temp_event_registrations WHERE booking_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.booking_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate booking code on insert
CREATE TRIGGER generate_booking_code_trigger
BEFORE INSERT ON public.temp_event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_booking_code();

-- Add RLS policy for admins to update registrations (for check-in)
CREATE POLICY "Admins can update registrations"
ON public.temp_event_registrations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update existing registrations with booking codes
UPDATE public.temp_event_registrations 
SET booking_code = UPPER(SUBSTRING(MD5(id::TEXT || created_at::TEXT) FROM 1 FOR 6))
WHERE booking_code IS NULL;