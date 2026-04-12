-- Permanent log of every redemption event (points drop from 500+ to below 500).
-- Written during CSV/Excel import. Never overwritten — grows forever.
CREATE TABLE redemption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  first_name TEXT NOT NULL,
  points_before INT NOT NULL,
  points_after INT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redemption_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage redemption_history"
  ON redemption_history FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX idx_redemption_history_customer_id ON redemption_history(customer_id);
CREATE INDEX idx_redemption_history_detected_at ON redemption_history(detected_at DESC);

-- Denormalized counter on customers for fast list display.
-- Incremented every time a redemption is detected on import.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_redemptions INT NOT NULL DEFAULT 0;
