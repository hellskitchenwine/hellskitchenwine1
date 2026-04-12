-- Add media_url to messages (was being inserted by edge function but column didn't exist)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Add per-message cost tracking so all-time spend can be calculated
-- Only populated for 'sent' messages; defaults to 0 for old historical rows
ALTER TABLE messages ADD COLUMN IF NOT EXISTS cost NUMERIC(10,4) NOT NULL DEFAULT 0;
