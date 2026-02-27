-- Check subscription plans
SELECT 'Subscription Plans:' as info;
SELECT name, price, billing_period, active FROM subscription_plans;

-- Check valuation multiples count
SELECT 'Valuation Multiples Count:' as info;
SELECT COUNT(*) as total_multiples FROM valuation_multiples;

-- Check admin users
SELECT 'Admin Users:' as info;
SELECT email, role FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN');
