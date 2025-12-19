-- Add wilaya column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN wilaya TEXT;

-- Add wilaya column to services table for service location
ALTER TABLE public.services 
ADD COLUMN wilaya TEXT;