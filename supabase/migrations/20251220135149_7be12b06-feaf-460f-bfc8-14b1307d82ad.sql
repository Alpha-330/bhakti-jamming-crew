-- Add referral_source column to temp_event_registrations
ALTER TABLE public.temp_event_registrations 
ADD COLUMN referral_source text;