-- Create campaigns table
-- Campaigns are created up-front and can receive multiple message sends
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reason TEXT,
  total_customers INT NOT NULL DEFAULT 0,
  total_sent INT NOT NULL DEFAULT 0,
  total_failed INT NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage campaigns"
  ON campaigns FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add campaign_id to messages
ALTER TABLE messages ADD COLUMN campaign_id UUID REFERENCES campaigns(id);

CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
