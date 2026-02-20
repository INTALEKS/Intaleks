-- Insert Free plan
INSERT INTO "subscription_plans" (
  "id",
  "name", 
  "price",
  "billing_period",
  "features",
  "active",
  "created_at",
  "updated_at"
) VALUES (
  'free_plan_001',
  'Free',
  0,
  'MONTHLY',
  ARRAY['Basic business valuation calculator', '1 valuation per month', 'Email support'],
  true,
  NOW(),
  NOW()
) ON CONFLICT ("name") DO NOTHING;
