-- Drop and recreate valuation_multiples table with all data
DROP TABLE IF EXISTS "valuation_multiples" CASCADE;

-- Recreate the table with correct structure
CREATE TABLE "valuation_multiples" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "score_range" TEXT NOT NULL,
    "multiple" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valuation_multiples_pkey" PRIMARY KEY ("id")
);

-- Add the correct unique constraint
CREATE UNIQUE INDEX "valuation_multiples_country_industry_score_range_key" ON "valuation_multiples"("country", "industry", "score_range");

-- Insert all 176 records directly
INSERT INTO "valuation_multiples" ("id", "country", "industry", "score_range", "multiple", "created_at", "updated_at") VALUES
-- Australia
('cm1', 'australia', 'technology', '40-50', 7.5, NOW(), NOW()),
('cm2', 'australia', 'technology', '30-39', 6.0, NOW(), NOW()),
('cm3', 'australia', 'technology', '20-29', 3.75, NOW(), NOW()),
('cm4', 'australia', 'technology', '<20', 2.25, NOW(), NOW()),

('cm5', 'australia', 'healthcare', '40-50', 6.5, NOW(), NOW()),
('cm6', 'australia', 'healthcare', '30-39', 5.2, NOW(), NOW()),
('cm7', 'australia', 'healthcare', '20-29', 3.25, NOW(), NOW()),
('cm8', 'australia', 'healthcare', '<20', 1.95, NOW(), NOW()),

('cm9', 'australia', 'manufacturing', '40-50', 5.0, NOW(), NOW()),
('cm10', 'australia', 'manufacturing', '30-39', 4.0, NOW(), NOW()),
('cm11', 'australia', 'manufacturing', '20-29', 2.5, NOW(), NOW()),
('cm12', 'australia', 'manufacturing', '<20', 1.5, NOW(), NOW()),

('cm13', 'australia', 'retail', '40-50', 4.5, NOW(), NOW()),
('cm14', 'australia', 'retail', '30-39', 3.6, NOW(), NOW()),
('cm15', 'australia', 'retail', '20-29', 2.25, NOW(), NOW()),
('cm16', 'australia', 'retail', '<20', 1.35, NOW(), NOW()),

('cm17', 'australia', 'professional-services', '40-50', 5.5, NOW(), NOW()),
('cm18', 'australia', 'professional-services', '30-39', 4.4, NOW(), NOW()),
('cm19', 'australia', 'professional-services', '20-29', 2.75, NOW(), NOW()),
('cm20', 'australia', 'professional-services', '<20', 1.65, NOW(), NOW()),

('cm21', 'australia', 'construction', '40-50', 4.0, NOW(), NOW()),
('cm22', 'australia', 'construction', '30-39', 3.2, NOW(), NOW()),
('cm23', 'australia', 'construction', '20-29', 2.0, NOW(), NOW()),
('cm24', 'australia', 'construction', '<20', 1.2, NOW(), NOW()),

('cm25', 'australia', 'hospitality', '40-50', 3.5, NOW(), NOW()),
('cm26', 'australia', 'hospitality', '30-39', 2.8, NOW(), NOW()),
('cm27', 'australia', 'hospitality', '20-29', 1.75, NOW(), NOW()),
('cm28', 'australia', 'hospitality', '<20', 1.05, NOW(), NOW()),

('cm29', 'australia', 'education', '40-50', 4.5, NOW(), NOW()),
('cm30', 'australia', 'education', '30-39', 3.6, NOW(), NOW()),
('cm31', 'australia', 'education', '20-29', 2.25, NOW(), NOW()),
('cm32', 'australia', 'education', '<20', 1.35, NOW(), NOW()),

('cm33', 'australia', 'finance', '40-50', 6.0, NOW(), NOW()),
('cm34', 'australia', 'finance', '30-39', 4.8, NOW(), NOW()),
('cm35', 'australia', 'finance', '20-29', 3.0, NOW(), NOW()),
('cm36', 'australia', 'finance', '<20', 1.8, NOW(), NOW()),

('cm37', 'australia', 'agriculture', '40-50', 3.0, NOW(), NOW()),
('cm38', 'australia', 'agriculture', '30-39', 2.4, NOW(), NOW()),
('cm39', 'australia', 'agriculture', '20-29', 1.5, NOW(), NOW()),
('cm40', 'australia', 'agriculture', '<20', 0.9, NOW(), NOW()),

('cm41', 'australia', 'other', '40-50', 4.0, NOW(), NOW()),
('cm42', 'australia', 'other', '30-39', 3.2, NOW(), NOW()),
('cm43', 'australia', 'other', '20-29', 2.0, NOW(), NOW()),
('cm44', 'australia', 'other', '<20', 1.2, NOW(), NOW()),

-- United States
('cm45', 'united states', 'technology', '40-50', 8.0, NOW(), NOW()),
('cm46', 'united states', 'technology', '30-39', 6.4, NOW(), NOW()),
('cm47', 'united states', 'technology', '20-29', 4.0, NOW(), NOW()),
('cm48', 'united states', 'technology', '<20', 2.4, NOW(), NOW()),

('cm49', 'united states', 'healthcare', '40-50', 7.0, NOW(), NOW()),
('cm50', 'united states', 'healthcare', '30-39', 5.6, NOW(), NOW()),
('cm51', 'united states', 'healthcare', '20-29', 3.5, NOW(), NOW()),
('cm52', 'united states', 'healthcare', '<20', 2.1, NOW(), NOW()),

('cm53', 'united states', 'manufacturing', '40-50', 5.5, NOW(), NOW()),
('cm54', 'united states', 'manufacturing', '30-39', 4.4, NOW(), NOW()),
('cm55', 'united states', 'manufacturing', '20-29', 2.75, NOW(), NOW()),
('cm56', 'united states', 'manufacturing', '<20', 1.65, NOW(), NOW()),

('cm57', 'united states', 'retail', '40-50', 5.0, NOW(), NOW()),
('cm58', 'united states', 'retail', '30-39', 4.0, NOW(), NOW()),
('cm59', 'united states', 'retail', '20-29', 2.5, NOW(), NOW()),
('cm60', 'united states', 'retail', '<20', 1.5, NOW(), NOW()),

('cm61', 'united states', 'professional-services', '40-50', 6.0, NOW(), NOW()),
('cm62', 'united states', 'professional-services', '30-39', 4.8, NOW(), NOW()),
('cm63', 'united states', 'professional-services', '20-29', 3.0, NOW(), NOW()),
('cm64', 'united states', 'professional-services', '<20', 1.8, NOW(), NOW()),

('cm65', 'united states', 'construction', '40-50', 4.5, NOW(), NOW()),
('cm66', 'united states', 'construction', '30-39', 3.6, NOW(), NOW()),
('cm67', 'united states', 'construction', '20-29', 2.25, NOW(), NOW()),
('cm68', 'united states', 'construction', '<20', 1.35, NOW(), NOW()),

('cm69', 'united states', 'hospitality', '40-50', 4.0, NOW(), NOW()),
('cm70', 'united states', 'hospitality', '30-39', 3.2, NOW(), NOW()),
('cm71', 'united states', 'hospitality', '20-29', 2.0, NOW(), NOW()),
('cm72', 'united states', 'hospitality', '<20', 1.2, NOW(), NOW()),

('cm73', 'united states', 'education', '40-50', 5.0, NOW(), NOW()),
('cm74', 'united states', 'education', '30-39', 4.0, NOW(), NOW()),
('cm75', 'united states', 'education', '20-29', 2.5, NOW(), NOW()),
('cm76', 'united states', 'education', '<20', 1.5, NOW(), NOW()),

('cm77', 'united states', 'finance', '40-50', 6.5, NOW(), NOW()),
('cm78', 'united states', 'finance', '30-39', 5.2, NOW(), NOW()),
('cm79', 'united states', 'finance', '20-29', 3.25, NOW(), NOW()),
('cm80', 'united states', 'finance', '<20', 1.95, NOW(), NOW()),

('cm81', 'united states', 'agriculture', '40-50', 3.5, NOW(), NOW()),
('cm82', 'united states', 'agriculture', '30-39', 2.8, NOW(), NOW()),
('cm83', 'united states', 'agriculture', '20-29', 1.75, NOW(), NOW()),
('cm84', 'united states', 'agriculture', '<20', 1.05, NOW(), NOW()),

('cm85', 'united states', 'other', '40-50', 4.5, NOW(), NOW()),
('cm86', 'united states', 'other', '30-39', 3.6, NOW(), NOW()),
('cm87', 'united states', 'other', '20-29', 2.25, NOW(), NOW()),
('cm88', 'united states', 'other', '<20', 1.35, NOW(), NOW()),

-- United Kingdom
('cm89', 'united kingdom', 'technology', '40-50', 7.0, NOW(), NOW()),
('cm90', 'united kingdom', 'technology', '30-39', 5.6, NOW(), NOW()),
('cm91', 'united kingdom', 'technology', '20-29', 3.5, NOW(), NOW()),
('cm92', 'united kingdom', 'technology', '<20', 2.1, NOW(), NOW()),

('cm93', 'united kingdom', 'healthcare', '40-50', 6.0, NOW(), NOW()),
('cm94', 'united kingdom', 'healthcare', '30-39', 4.8, NOW(), NOW()),
('cm95', 'united kingdom', 'healthcare', '20-29', 3.0, NOW(), NOW()),
('cm96', 'united kingdom', 'healthcare', '<20', 1.8, NOW(), NOW()),

('cm97', 'united kingdom', 'manufacturing', '40-50', 4.5, NOW(), NOW()),
('cm98', 'united kingdom', 'manufacturing', '30-39', 3.6, NOW(), NOW()),
('cm99', 'united kingdom', 'manufacturing', '20-29', 2.25, NOW(), NOW()),
('cm100', 'united kingdom', 'manufacturing', '<20', 1.35, NOW(), NOW()),

('cm101', 'united kingdom', 'retail', '40-50', 4.0, NOW(), NOW()),
('cm102', 'united kingdom', 'retail', '30-39', 3.2, NOW(), NOW()),
('cm103', 'united kingdom', 'retail', '20-29', 2.0, NOW(), NOW()),
('cm104', 'united kingdom', 'retail', '<20', 1.2, NOW(), NOW()),

('cm105', 'united kingdom', 'professional-services', '40-50', 5.0, NOW(), NOW()),
('cm106', 'united kingdom', 'professional-services', '30-39', 4.0, NOW(), NOW()),
('cm107', 'united kingdom', 'professional-services', '20-29', 2.5, NOW(), NOW()),
('cm108', 'united kingdom', 'professional-services', '<20', 1.5, NOW(), NOW()),

('cm109', 'united kingdom', 'construction', '40-50', 3.5, NOW(), NOW()),
('cm110', 'united kingdom', 'construction', '30-39', 2.8, NOW(), NOW()),
('cm111', 'united kingdom', 'construction', '20-29', 1.75, NOW(), NOW()),
('cm112', 'united kingdom', 'construction', '<20', 1.05, NOW(), NOW()),

('cm113', 'united kingdom', 'hospitality', '40-50', 3.0, NOW(), NOW()),
('cm114', 'united kingdom', 'hospitality', '30-39', 2.4, NOW(), NOW()),
('cm115', 'united kingdom', 'hospitality', '20-29', 1.5, NOW(), NOW()),
('cm116', 'united kingdom', 'hospitality', '<20', 0.9, NOW(), NOW()),

('cm117', 'united kingdom', 'education', '40-50', 4.0, NOW(), NOW()),
('cm118', 'united kingdom', 'education', '30-39', 3.2, NOW(), NOW()),
('cm119', 'united kingdom', 'education', '20-29', 2.0, NOW(), NOW()),
('cm120', 'united kingdom', 'education', '<20', 1.2, NOW(), NOW()),

('cm121', 'united kingdom', 'finance', '40-50', 5.5, NOW(), NOW()),
('cm122', 'united kingdom', 'finance', '30-39', 4.4, NOW(), NOW()),
('cm123', 'united kingdom', 'finance', '20-29', 2.75, NOW(), NOW()),
('cm124', 'united kingdom', 'finance', '<20', 1.65, NOW(), NOW()),

('cm125', 'united kingdom', 'agriculture', '40-50', 2.5, NOW(), NOW()),
('cm126', 'united kingdom', 'agriculture', '30-39', 2.0, NOW(), NOW()),
('cm127', 'united kingdom', 'agriculture', '20-29', 1.25, NOW(), NOW()),
('cm128', 'united kingdom', 'agriculture', '<20', 0.75, NOW(), NOW()),

('cm129', 'united kingdom', 'other', '40-50', 3.5, NOW(), NOW()),
('cm130', 'united kingdom', 'other', '30-39', 2.8, NOW(), NOW()),
('cm131', 'united kingdom', 'other', '20-29', 1.75, NOW(), NOW()),
('cm132', 'united kingdom', 'other', '<20', 1.05, NOW(), NOW()),

-- Canada
('cm133', 'canada', 'technology', '40-50', 7.5, NOW(), NOW()),
('cm134', 'canada', 'technology', '30-39', 6.0, NOW(), NOW()),
('cm135', 'canada', 'technology', '20-29', 3.75, NOW(), NOW()),
('cm136', 'canada', 'technology', '<20', 2.25, NOW(), NOW()),

('cm137', 'canada', 'healthcare', '40-50', 6.5, NOW(), NOW()),
('cm138', 'canada', 'healthcare', '30-39', 5.2, NOW(), NOW()),
('cm139', 'canada', 'healthcare', '20-29', 3.25, NOW(), NOW()),
('cm140', 'canada', 'healthcare', '<20', 1.95, NOW(), NOW()),

('cm141', 'canada', 'manufacturing', '40-50', 5.0, NOW(), NOW()),
('cm142', 'canada', 'manufacturing', '30-39', 4.0, NOW(), NOW()),
('cm143', 'canada', 'manufacturing', '20-29', 2.5, NOW(), NOW()),
('cm144', 'canada', 'manufacturing', '<20', 1.5, NOW(), NOW()),

('cm145', 'canada', 'retail', '40-50', 4.5, NOW(), NOW()),
('cm146', 'canada', 'retail', '30-39', 3.6, NOW(), NOW()),
('cm147', 'canada', 'retail', '20-29', 2.25, NOW(), NOW()),
('cm148', 'canada', 'retail', '<20', 1.35, NOW(), NOW()),

('cm149', 'canada', 'professional-services', '40-50', 5.5, NOW(), NOW()),
('cm150', 'canada', 'professional-services', '30-39', 4.4, NOW(), NOW()),
('cm151', 'canada', 'professional-services', '20-29', 2.75, NOW(), NOW()),
('cm152', 'canada', 'professional-services', '<20', 1.65, NOW(), NOW()),

('cm153', 'canada', 'construction', '40-50', 4.0, NOW(), NOW()),
('cm154', 'canada', 'construction', '30-39', 3.2, NOW(), NOW()),
('cm155', 'canada', 'construction', '20-29', 2.0, NOW(), NOW()),
('cm156', 'canada', 'construction', '<20', 1.2, NOW(), NOW()),

('cm157', 'canada', 'hospitality', '40-50', 3.5, NOW(), NOW()),
('cm158', 'canada', 'hospitality', '30-39', 2.8, NOW(), NOW()),
('cm159', 'canada', 'hospitality', '20-29', 1.75, NOW(), NOW()),
('cm160', 'canada', 'hospitality', '<20', 1.05, NOW(), NOW()),

('cm161', 'canada', 'education', '40-50', 4.5, NOW(), NOW()),
('cm162', 'canada', 'education', '30-39', 3.6, NOW(), NOW()),
('cm163', 'canada', 'education', '20-29', 2.25, NOW(), NOW()),
('cm164', 'canada', 'education', '<20', 1.35, NOW(), NOW()),

('cm165', 'canada', 'finance', '40-50', 6.0, NOW(), NOW()),
('cm166', 'canada', 'finance', '30-39', 4.8, NOW(), NOW()),
('cm167', 'canada', 'finance', '20-29', 3.0, NOW(), NOW()),
('cm168', 'canada', 'finance', '<20', 1.8, NOW(), NOW()),

('cm169', 'canada', 'agriculture', '40-50', 3.0, NOW(), NOW()),
('cm170', 'canada', 'agriculture', '30-39', 2.4, NOW(), NOW()),
('cm171', 'canada', 'agriculture', '20-29', 1.5, NOW(), NOW()),
('cm172', 'canada', 'agriculture', '<20', 0.9, NOW(), NOW()),

('cm173', 'canada', 'other', '40-50', 4.0, NOW(), NOW()),
('cm174', 'canada', 'other', '30-39', 3.2, NOW(), NOW()),
('cm175', 'canada', 'other', '20-29', 2.0, NOW(), NOW()),
('cm176', 'canada', 'other', '<20', 1.2, NOW(), NOW());