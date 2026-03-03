-- Reading Room Chat Service Database Schema
-- Run this in your Supabase SQL editor

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK (room_type IN ('free-participation', 'assigned-book')),
    book_title TEXT,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    current_mode TEXT NOT NULL DEFAULT 'chat' CHECK (current_mode IN ('impression', 'chat'))
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms table
-- Allow anyone to read room information (needed for room listing)
CREATE POLICY "Allow read access to all rooms" ON public.rooms
    FOR SELECT USING (true);

-- Allow anyone to insert new rooms (anonymous room creation)
CREATE POLICY "Allow insert access for room creation" ON public.rooms
    FOR INSERT WITH CHECK (true);

-- [SECURITY IMPROVEMENT] Restrict UPDATE to only allow mode changes on non-expired rooms.
-- Replace the permissive policy below with:
--   CREATE POLICY "Allow update mode on active rooms" ON public.rooms
--       FOR UPDATE USING (expires_at > NOW())
--       WITH CHECK (expires_at > NOW());
CREATE POLICY "Allow update access to all rooms" ON public.rooms
    FOR UPDATE USING (true);

-- [SECURITY IMPROVEMENT] Restrict DELETE to expired rooms only for anon role.
-- Server-side cleanup (service_role) can delete any room.
-- Replace the permissive policy below with:
--   CREATE POLICY "Allow delete only expired rooms" ON public.rooms
--       FOR DELETE USING (expires_at < NOW());
CREATE POLICY "Allow delete access to all rooms" ON public.rooms
    FOR DELETE USING (true);

-- Enable Realtime for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Create an index on expires_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON public.rooms(expires_at);

-- Create an index on created_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);

-- Function to clean up expired rooms (to be called by a scheduled job or trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.rooms
    WHERE expires_at < NOW();
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- [SECURITY IMPROVEMENT] Restrict anon permissions. Currently grants ALL.
-- Recommended: GRANT SELECT, INSERT ON public.rooms TO anon;
-- UPDATE/DELETE should be done via service_role (server-side API routes) or
-- restricted by RLS policies above.
GRANT ALL ON public.rooms TO anon, authenticated;
-- [SECURITY IMPROVEMENT] cleanup_expired_rooms() is SECURITY DEFINER, so
-- consider revoking EXECUTE from anon and only calling it from server-side:
--   REVOKE EXECUTE ON FUNCTION cleanup_expired_rooms() FROM anon;
--   GRANT EXECUTE ON FUNCTION cleanup_expired_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_rooms() TO anon, authenticated;