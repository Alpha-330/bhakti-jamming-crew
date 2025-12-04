-- Phase 1: Security - Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Phase 5: Razorpay - Add price to events and create registrations table
ALTER TABLE public.events ADD COLUMN price INTEGER DEFAULT 100;
ALTER TABLE public.events ADD COLUMN max_attendees INTEGER DEFAULT NULL;

-- Create event_registrations table
CREATE TABLE public.event_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS for event_registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations"
ON public.event_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update registrations"
ON public.event_registrations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
ON public.event_registrations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add new site_settings for editable homepage
INSERT INTO public.site_settings (key, value) VALUES
('hero_title', 'Bhakti Jamming Crew'),
('hero_subtitle', 'Join us for soulful kirtan sessions that blend traditional devotional music with contemporary expressions. Experience the joy of community singing and spiritual connection.'),
('hero_tags', 'Kirtan,Bhajan,Live Sessions,Community'),
('about_title', 'About Our Journey'),
('about_description', 'Bhakti Jamming Crew brings together music enthusiasts and spiritual seekers in a celebration of devotional music. Our sessions create a sacred space where traditional melodies meet modern hearts.'),
('mission_quote', 'Through the power of sacred sound, we create spaces where hearts open, communities connect, and souls find their rhythm in the eternal dance of devotion.'),
('gallery_title', 'Captured Moments'),
('gallery_description', 'Glimpses from our kirtan sessions and community gatherings'),
('footer_tagline', 'Unite through the power of sacred sound')
ON CONFLICT (key) DO NOTHING;