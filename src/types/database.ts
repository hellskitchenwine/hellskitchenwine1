export interface Customer {
  id: string;
  first_name: string;
  phone: string;
  points: number;
  previous_points: number;
  recently_redeemed: boolean;
  opted_out: boolean;
  total_redemptions: number;
  created_at: string;
  updated_at: string;
}

export interface RedemptionHistory {
  id: string;
  customer_id: string;
  phone: string;
  first_name: string;
  points_before: number;
  points_after: number;
  detected_at: string;
}

export interface Message {
  id: string;
  customer_id: string | null;
  campaign_id: string | null;
  phone: string;
  message_body: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  twilio_sid: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  reason: string | null;
  total_customers: number;
  total_sent: number;
  total_failed: number;
  total_cost: number;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}
