-- ============================================
-- GENERATE 100 TEST POLLS FOR POLLZ APP
-- ============================================
-- Run this script in Supabase SQL Editor to create 100 diverse test polls
-- 
-- Prerequisites:
-- 1. At least one user must exist in the users table
-- 2. If no users exist, the admin user will be created automatically
-- 
-- Usage:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Verify polls were created: SELECT COUNT(*) FROM polls;

-- ============================================
-- STEP 1: Ensure we have users to assign as authors
-- ============================================

-- Create admin user if it doesn't exist
INSERT INTO users (name, username, email, password_hash, role, avatar)
VALUES (
  'Admin',
  '@admin',
  'admin@pollz.app',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'https://ui-avatars.com/api/?name=Admin&background=ff0000&color=ffffff&size=150'
)
ON CONFLICT (email) DO NOTHING;

-- Create a few test users if they don't exist (for variety)
INSERT INTO users (name, username, email, password_hash, role, avatar)
VALUES 
  ('Alex Johnson', '@alexj', 'alex@pollz.app', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 'https://ui-avatars.com/api/?name=Alex+Johnson&background=667eea&color=ffffff&size=150'),
  ('Sarah Chen', '@sarahc', 'sarah@pollz.app', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 'https://ui-avatars.com/api/?name=Sarah+Chen&background=764ba2&color=ffffff&size=150'),
  ('Mike Davis', '@miked', 'mike@pollz.app', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 'https://ui-avatars.com/api/?name=Mike+Davis&background=4facfe&color=ffffff&size=150')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- STEP 2: Insert 100 Diverse Polls
-- ============================================

WITH poll_templates AS (
  SELECT 
    title, description, category, option_a, option_b, context
  FROM (VALUES
    -- Food Category (15 polls)
    ('Pizza vs Burgers?', 'The ultimate fast food showdown', 'Food', 'Pizza', 'Burgers', 'Which comfort food reigns supreme?'),
    ('Coffee vs Tea?', 'Morning beverage debate', 'Food', 'Coffee', 'Tea', 'The eternal morning drink question'),
    ('Sushi vs Tacos?', 'International cuisine battle', 'Food', 'Sushi', 'Tacos', 'Two amazing cuisines, one winner'),
    ('Chocolate vs Vanilla?', 'Classic ice cream flavors', 'Food', 'Chocolate', 'Vanilla', 'The timeless ice cream debate'),
    ('Breakfast vs Dinner?', 'Best meal of the day', 'Food', 'Breakfast', 'Dinner', 'Which meal do you look forward to most?'),
    ('Sweet vs Savory?', 'Taste preference', 'Food', 'Sweet', 'Savory', 'What satisfies your cravings?'),
    ('Hot Dogs vs Sandwiches?', 'Lunch debate', 'Food', 'Hot Dogs', 'Sandwiches', 'Quick lunch option preference'),
    ('Pasta vs Rice?', 'Carb preference', 'Food', 'Pasta', 'Rice', 'Which staple food do you prefer?'),
    ('Steak vs Chicken?', 'Protein choice', 'Food', 'Steak', 'Chicken', 'Your go-to protein source'),
    ('Pineapple on Pizza?', 'The most controversial food debate', 'Food', 'Yes, delicious!', 'No, never!', 'The debate that divides families'),
    ('Cereal: Milk First or Cereal First?', 'The breakfast debate', 'Food', 'Cereal First', 'Milk First', 'Proper cereal preparation method'),
    ('Ketchup vs Mustard?', 'Condiment preference', 'Food', 'Ketchup', 'Mustard', 'Which condiment do you reach for first?'),
    ('Pancakes vs Waffles?', 'Breakfast battle', 'Food', 'Pancakes', 'Waffles', 'The ultimate breakfast showdown'),
    ('Soda vs Juice?', 'Beverage choice', 'Food', 'Soda', 'Juice', 'Your preferred sweet drink'),
    ('Cookies vs Cake?', 'Dessert preference', 'Food', 'Cookies', 'Cake', 'Which sweet treat wins?'),
    
    -- Technology Category (15 polls)
    ('iOS vs Android?', 'Mobile OS preference', 'Technology', 'iOS', 'Android', 'The smartphone platform debate'),
    ('Mac vs PC?', 'Computer platform debate', 'Technology', 'Mac', 'PC', 'Which computing platform is superior?'),
    ('Tabs vs Spaces?', 'Code indentation holy war', 'Technology', 'Tabs', 'Spaces', 'The programmer''s eternal debate'),
    ('Dark Mode vs Light Mode?', 'UI theme preference', 'Technology', 'Dark Mode', 'Light Mode', 'Which interface style is better?'),
    ('Chrome vs Firefox?', 'Browser choice', 'Technology', 'Chrome', 'Firefox', 'Your preferred web browser'),
    ('TypeScript vs JavaScript?', 'Programming language', 'Technology', 'TypeScript', 'JavaScript', 'Which language do you prefer?'),
    ('React vs Vue?', 'Frontend framework', 'Technology', 'React', 'Vue', 'The framework battle'),
    ('Git vs SVN?', 'Version control', 'Technology', 'Git', 'SVN', 'Version control system preference'),
    ('Windows vs Linux?', 'Operating system', 'Technology', 'Windows', 'Linux', 'Desktop OS preference'),
    ('Wireless vs Wired?', 'Connectivity preference', 'Technology', 'Wireless', 'Wired', 'Which connection type do you prefer?'),
    ('Laptop vs Desktop?', 'Computer form factor', 'Technology', 'Laptop', 'Desktop', 'Your preferred computing setup'),
    ('Cloud Storage vs Local Storage?', 'Data storage preference', 'Technology', 'Cloud', 'Local', 'Where do you store your files?'),
    ('Mechanical vs Membrane Keyboard?', 'Keyboard type', 'Technology', 'Mechanical', 'Membrane', 'Which keyboard feels better?'),
    ('Streaming vs Physical Media?', 'Content consumption', 'Technology', 'Streaming', 'Physical', 'How do you consume media?'),
    ('AI Assistant vs Human Assistant?', 'Assistant preference', 'Technology', 'AI Assistant', 'Human Assistant', 'Which type of help do you prefer?'),
    
    -- Lifestyle Category (15 polls)
    ('Morning Person vs Night Owl?', 'Sleep schedule', 'Lifestyle', 'Morning Person', 'Night Owl', 'When are you most productive?'),
    ('Cats vs Dogs?', 'Pet preference', 'Lifestyle', 'Cats', 'Dogs', 'The ultimate pet debate'),
    ('Beach vs Mountains?', 'Vacation destination', 'Lifestyle', 'Beach', 'Mountains', 'Perfect getaway location'),
    ('Summer vs Winter?', 'Favorite season', 'Lifestyle', 'Summer', 'Winter', 'Which season brings you joy?'),
    ('City vs Countryside?', 'Living preference', 'Lifestyle', 'City', 'Countryside', 'Where would you rather live?'),
    ('Shower vs Bath?', 'Bathing preference', 'Lifestyle', 'Shower', 'Bath', 'Your preferred way to get clean'),
    ('Hot Shower vs Cold Shower?', 'Shower temperature', 'Lifestyle', 'Hot', 'Cold', 'Which wakes you up better?'),
    ('Early Bird vs Late Sleeper?', 'Wake up time', 'Lifestyle', 'Early Bird', 'Late Sleeper', 'Your natural wake-up preference'),
    ('Minimalist vs Maximalist?', 'Lifestyle philosophy', 'Lifestyle', 'Minimalist', 'Maximalist', 'Your approach to possessions'),
    ('Introvert vs Extrovert?', 'Personality type', 'Lifestyle', 'Introvert', 'Extrovert', 'How do you recharge?'),
    ('Planner vs Spontaneous?', 'Life approach', 'Lifestyle', 'Planner', 'Spontaneous', 'How do you approach your day?'),
    ('Early Riser vs Night Person?', 'Daily rhythm', 'Lifestyle', 'Early Riser', 'Night Person', 'Your peak energy time'),
    ('Organized vs Messy?', 'Living space style', 'Lifestyle', 'Organized', 'Messy', 'How do you keep your space?'),
    ('Fitness Enthusiast vs Couch Potato?', 'Activity level', 'Lifestyle', 'Fitness Enthusiast', 'Couch Potato', 'Your preferred activity level'),
    ('Social Media vs Real Life?', 'Social interaction preference', 'Lifestyle', 'Social Media', 'Real Life', 'How do you prefer to connect?'),
    
    -- Work Category (15 polls)
    ('Work from Home vs Office?', 'Work location preference', 'Work', 'Work from Home', 'Office', 'Where are you most productive?'),
    ('Freelance vs Full-time?', 'Employment type', 'Work', 'Freelance', 'Full-time', 'Your preferred work arrangement'),
    ('Email vs Slack?', 'Communication tool', 'Work', 'Email', 'Slack', 'Which do you prefer for work communication?'),
    ('Meetings vs Deep Work?', 'Work style', 'Work', 'Meetings', 'Deep Work', 'How do you get things done?'),
    ('Startup vs Corporate?', 'Company size', 'Work', 'Startup', 'Corporate', 'Your preferred work environment'),
    ('Salary vs Equity?', 'Compensation preference', 'Work', 'Salary', 'Equity', 'What matters more in compensation?'),
    ('Remote vs Hybrid?', 'Work model', 'Work', 'Remote', 'Hybrid', 'Your ideal work arrangement'),
    ('Manager vs Individual Contributor?', 'Career path', 'Work', 'Manager', 'IC', 'Which career path appeals to you?'),
    ('Agile vs Waterfall?', 'Project management', 'Work', 'Agile', 'Waterfall', 'Your preferred project methodology'),
    ('4-day vs 5-day Week?', 'Work schedule', 'Work', '4-day', '5-day', 'Ideal work week length'),
    ('Morning Meetings vs Afternoon Meetings?', 'Meeting timing', 'Work', 'Morning', 'Afternoon', 'When do you prefer meetings?'),
    ('Solo Work vs Team Collaboration?', 'Work preference', 'Work', 'Solo Work', 'Team Collaboration', 'How do you work best?'),
    ('Deadline Pressure vs No Pressure?', 'Work style', 'Work', 'Deadline Pressure', 'No Pressure', 'What motivates you more?'),
    ('Open Office vs Private Office?', 'Workspace preference', 'Work', 'Open Office', 'Private Office', 'Your ideal workspace setup'),
    ('Fixed Hours vs Flexible Hours?', 'Schedule preference', 'Work', 'Fixed Hours', 'Flexible Hours', 'Which schedule works better for you?'),
    
    -- Entertainment Category (15 polls)
    ('Netflix vs YouTube?', 'Streaming platform', 'Entertainment', 'Netflix', 'YouTube', 'Your go-to streaming service'),
    ('Movies vs TV Series?', 'Content format', 'Entertainment', 'Movies', 'TV Series', 'Which format do you prefer?'),
    ('Books vs Movies?', 'Story medium', 'Entertainment', 'Books', 'Movies', 'Best way to experience a story'),
    ('Marvel vs DC?', 'Superhero universe', 'Entertainment', 'Marvel', 'DC', 'The ultimate superhero debate'),
    ('Gaming vs Reading?', 'Leisure activity', 'Entertainment', 'Gaming', 'Reading', 'How do you unwind?'),
    ('PlayStation vs Xbox?', 'Gaming console', 'Entertainment', 'PlayStation', 'Xbox', 'Console preference'),
    ('Spotify vs Apple Music?', 'Music streaming', 'Entertainment', 'Spotify', 'Apple Music', 'Your music platform of choice'),
    ('Podcasts vs Audiobooks?', 'Audio content', 'Entertainment', 'Podcasts', 'Audiobooks', 'What do you listen to?'),
    ('Comedy vs Drama?', 'Genre preference', 'Entertainment', 'Comedy', 'Drama', 'Which genre do you prefer?'),
    ('Live Concert vs Studio Album?', 'Music experience', 'Entertainment', 'Live Concert', 'Studio Album', 'Best way to experience music'),
    ('Action Movies vs Comedy Movies?', 'Movie genre', 'Entertainment', 'Action', 'Comedy', 'Your preferred movie type'),
    ('Binge Watch vs Weekly Episodes?', 'Watching style', 'Entertainment', 'Binge Watch', 'Weekly Episodes', 'How do you consume shows?'),
    ('Theater vs Home Viewing?', 'Movie experience', 'Entertainment', 'Theater', 'Home', 'Where do you prefer to watch movies?'),
    ('Physical Books vs E-books?', 'Reading format', 'Entertainment', 'Physical Books', 'E-books', 'Your preferred reading method'),
    ('Single Player vs Multiplayer Games?', 'Gaming preference', 'Entertainment', 'Single Player', 'Multiplayer', 'How do you prefer to game?'),
    
    -- Sports Category (10 polls)
    ('Football vs Basketball?', 'Favorite sport', 'Sports', 'Football', 'Basketball', 'Which sport is more exciting?'),
    ('Team Sports vs Individual Sports?', 'Sport type', 'Sports', 'Team', 'Individual', 'Your preferred sport category'),
    ('Gym vs Home Workout?', 'Fitness location', 'Sports', 'Gym', 'Home', 'Where do you prefer to exercise?'),
    ('Running vs Cycling?', 'Cardio preference', 'Sports', 'Running', 'Cycling', 'Your preferred cardio exercise'),
    ('Yoga vs Pilates?', 'Mind-body exercise', 'Sports', 'Yoga', 'Pilates', 'Which practice do you prefer?'),
    ('Swimming vs Running?', 'Endurance sport', 'Sports', 'Swimming', 'Running', 'Best full-body workout'),
    ('Soccer vs American Football?', 'Football debate', 'Sports', 'Soccer', 'American Football', 'The football name debate'),
    ('Tennis vs Badminton?', 'Racket sport', 'Sports', 'Tennis', 'Badminton', 'Which racket sport is better?'),
    ('Boxing vs MMA?', 'Combat sport', 'Sports', 'Boxing', 'MMA', 'The ultimate combat sport'),
    ('Winter Sports vs Summer Sports?', 'Seasonal preference', 'Sports', 'Winter', 'Summer', 'Which season has better sports?'),
    
    -- Travel Category (10 polls)
    ('Plane vs Train?', 'Travel method', 'Travel', 'Plane', 'Train', 'Your preferred mode of long-distance travel'),
    ('Hotel vs Airbnb?', 'Accommodation', 'Travel', 'Hotel', 'Airbnb', 'Where do you prefer to stay?'),
    ('Solo Travel vs Group Travel?', 'Travel style', 'Travel', 'Solo', 'Group', 'How do you prefer to travel?'),
    ('Adventure vs Relaxation?', 'Vacation type', 'Travel', 'Adventure', 'Relaxation', 'Your ideal vacation style'),
    ('Domestic vs International?', 'Travel destination', 'Travel', 'Domestic', 'International', 'Where do you prefer to explore?'),
    ('Backpacking vs Luxury?', 'Travel budget', 'Travel', 'Backpacking', 'Luxury', 'Your travel style preference'),
    ('Road Trip vs Flight?', 'Journey preference', 'Travel', 'Road Trip', 'Flight', 'How do you prefer to get there?'),
    ('Cruise vs Resort?', 'Vacation format', 'Travel', 'Cruise', 'Resort', 'Your preferred vacation package'),
    ('Europe vs Asia?', 'Continent preference', 'Travel', 'Europe', 'Asia', 'Which continent to explore first?'),
    ('Camping vs Glamping?', 'Outdoor experience', 'Travel', 'Camping', 'Glamping', 'Your preferred outdoor stay'),
    
    -- Education Category (5 polls)
    ('Online Learning vs In-Person?', 'Learning format', 'Education', 'Online', 'In-Person', 'Which learning method works better?'),
    ('STEM vs Humanities?', 'Field of study', 'Education', 'STEM', 'Humanities', 'Your preferred academic field'),
    ('Theory vs Practice?', 'Learning approach', 'Education', 'Theory', 'Practice', 'How do you learn best?'),
    ('University vs Self-Taught?', 'Education path', 'Education', 'University', 'Self-Taught', 'Your preferred learning path'),
    ('Group Study vs Solo Study?', 'Study method', 'Education', 'Group', 'Solo', 'How do you study most effectively?')
  ) AS poll_data(title, description, category, option_a, option_b, context)
),
poll_with_users AS (
  SELECT 
    pt.title,
    pt.description,
    pt.category,
    pt.option_a,
    pt.option_b,
    pt.context,
    u.id as author_id,
    u.name as author_name,
    u.username as author_username
  FROM poll_templates pt
  CROSS JOIN LATERAL (
    SELECT id, name, username
    FROM users
    ORDER BY RANDOM()
    LIMIT 1
  ) u
  LIMIT 100
)
INSERT INTO polls (
  title, 
  description, 
  category, 
  author_id, 
  author_name, 
  author_username,
  option_a, 
  option_b, 
  context,
  votes, 
  votes_option_a, 
  votes_option_b,
  expires_at, 
  created_at,
  trending_score,
  poll_type,
  timer_enabled,
  notification_enabled,
  is_deathmatch,
  is_shadow_deathmatch,
  deathmatch_status
)
SELECT 
  title,
  description,
  category,
  author_id,
  author_name,
  author_username,
  option_a,
  option_b,
  context,
  0 as votes,
  0 as votes_option_a,
  0 as votes_option_b,
  NOW() + (RANDOM() * INTERVAL '7 days' + INTERVAL '1 hour') as expires_at,
  NOW() - (RANDOM() * INTERVAL '7 days') as created_at,
  (50 + RANDOM() * 200)::DECIMAL as trending_score,
  'question' as poll_type,
  true as timer_enabled,
  (RANDOM() > 0.5) as notification_enabled,
  false as is_deathmatch,
  false as is_shadow_deathmatch,
  'accepted' as deathmatch_status
FROM poll_with_users;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check how many polls were created
SELECT 
  COUNT(*) as total_polls,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT author_id) as unique_authors
FROM polls;

-- Show polls by category
SELECT 
  category,
  COUNT(*) as poll_count
FROM polls
GROUP BY category
ORDER BY poll_count DESC;

-- Show recent polls
SELECT 
  title,
  category,
  author_name,
  created_at,
  expires_at
FROM polls
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- SUCCESS!
-- ============================================
-- ✅ 100 polls have been created!
-- 
-- Next steps:
-- 1. Refresh your app to see the new polls
-- 2. Test voting functionality
-- 3. Check different categories
-- 4. Verify poll expiration times
-- 
-- To delete all test polls (if needed):
-- DELETE FROM polls WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@pollz.app');

