/**
 * Generate 100 Test Polls for Supabase Database
 * 
 * This script creates 100 diverse polls across multiple categories
 * for testing the Pollz application.
 * 
 * Usage:
 * - Import and call generate100TestPolls() from browser console or admin panel
 * - Or run: npm run generate-polls (if script is added to package.json)
 */

import SupabasePollzAPI from '../database/supabase-api'
import { User } from '../types'

interface PollTemplate {
  title: string
  description: string
  optionA: string
  optionB: string
  category: string
  context?: string
}

// Comprehensive poll templates across all categories
const pollTemplates: PollTemplate[] = [
  // Food Category (15 polls)
  { title: 'Pizza vs Burgers?', description: 'The ultimate fast food showdown', optionA: 'Pizza', optionB: 'Burgers', category: 'Food', context: 'Which comfort food reigns supreme?' },
  { title: 'Coffee vs Tea?', description: 'Morning beverage debate', optionA: 'Coffee', optionB: 'Tea', category: 'Food', context: 'The eternal morning drink question' },
  { title: 'Sushi vs Tacos?', description: 'International cuisine battle', optionA: 'Sushi', optionB: 'Tacos', category: 'Food', context: 'Two amazing cuisines, one winner' },
  { title: 'Chocolate vs Vanilla?', description: 'Classic ice cream flavors', optionA: 'Chocolate', optionB: 'Vanilla', category: 'Food', context: 'The timeless ice cream debate' },
  { title: 'Breakfast vs Dinner?', description: 'Best meal of the day', optionA: 'Breakfast', optionB: 'Dinner', category: 'Food', context: 'Which meal do you look forward to most?' },
  { title: 'Sweet vs Savory?', description: 'Taste preference', optionA: 'Sweet', optionB: 'Savory', category: 'Food', context: 'What satisfies your cravings?' },
  { title: 'Hot Dogs vs Sandwiches?', description: 'Lunch debate', optionA: 'Hot Dogs', optionB: 'Sandwiches', category: 'Food', context: 'Quick lunch option preference' },
  { title: 'Pasta vs Rice?', description: 'Carb preference', optionA: 'Pasta', optionB: 'Rice', category: 'Food', context: 'Which staple food do you prefer?' },
  { title: 'Steak vs Chicken?', description: 'Protein choice', optionA: 'Steak', optionB: 'Chicken', category: 'Food', context: 'Your go-to protein source' },
  { title: 'Pineapple on Pizza?', description: 'The most controversial food debate', optionA: 'Yes, delicious!', optionB: 'No, never!', category: 'Food', context: 'The debate that divides families' },
  { title: 'Cereal: Milk First or Cereal First?', description: 'The breakfast debate', optionA: 'Cereal First', optionB: 'Milk First', category: 'Food', context: 'Proper cereal preparation method' },
  { title: 'Ketchup vs Mustard?', description: 'Condiment preference', optionA: 'Ketchup', optionB: 'Mustard', category: 'Food', context: 'Which condiment do you reach for first?' },
  { title: 'Pancakes vs Waffles?', description: 'Breakfast battle', optionA: 'Pancakes', optionB: 'Waffles', category: 'Food', context: 'The ultimate breakfast showdown' },
  { title: 'Soda vs Juice?', description: 'Beverage choice', optionA: 'Soda', optionB: 'Juice', category: 'Food', context: 'Your preferred sweet drink' },
  { title: 'Cookies vs Cake?', description: 'Dessert preference', optionA: 'Cookies', optionB: 'Cake', category: 'Food', context: 'Which sweet treat wins?' },
  
  // Technology Category (15 polls)
  { title: 'iOS vs Android?', description: 'Mobile OS preference', optionA: 'iOS', optionB: 'Android', category: 'Technology', context: 'The smartphone platform debate' },
  { title: 'Mac vs PC?', description: 'Computer platform debate', optionA: 'Mac', optionB: 'PC', category: 'Technology', context: 'Which computing platform is superior?' },
  { title: 'Tabs vs Spaces?', description: 'Code indentation holy war', optionA: 'Tabs', optionB: 'Spaces', category: 'Technology', context: 'The programmer\'s eternal debate' },
  { title: 'Dark Mode vs Light Mode?', description: 'UI theme preference', optionA: 'Dark Mode', optionB: 'Light Mode', category: 'Technology', context: 'Which interface style is better?' },
  { title: 'Chrome vs Firefox?', description: 'Browser choice', optionA: 'Chrome', optionB: 'Firefox', category: 'Technology', context: 'Your preferred web browser' },
  { title: 'TypeScript vs JavaScript?', description: 'Programming language', optionA: 'TypeScript', optionB: 'JavaScript', category: 'Technology', context: 'Which language do you prefer?' },
  { title: 'React vs Vue?', description: 'Frontend framework', optionA: 'React', optionB: 'Vue', category: 'Technology', context: 'The framework battle' },
  { title: 'Git vs SVN?', description: 'Version control', optionA: 'Git', optionB: 'SVN', category: 'Technology', context: 'Version control system preference' },
  { title: 'Windows vs Linux?', description: 'Operating system', optionA: 'Windows', optionB: 'Linux', category: 'Technology', context: 'Desktop OS preference' },
  { title: 'Wireless vs Wired?', description: 'Connectivity preference', optionA: 'Wireless', optionB: 'Wired', category: 'Technology', context: 'Which connection type do you prefer?' },
  { title: 'Laptop vs Desktop?', description: 'Computer form factor', optionA: 'Laptop', optionB: 'Desktop', category: 'Technology', context: 'Your preferred computing setup' },
  { title: 'Cloud Storage vs Local Storage?', description: 'Data storage preference', optionA: 'Cloud', optionB: 'Local', category: 'Technology', context: 'Where do you store your files?' },
  { title: 'Mechanical vs Membrane Keyboard?', description: 'Keyboard type', optionA: 'Mechanical', optionB: 'Membrane', category: 'Technology', context: 'Which keyboard feels better?' },
  { title: 'Streaming vs Physical Media?', description: 'Content consumption', optionA: 'Streaming', optionB: 'Physical', category: 'Technology', context: 'How do you consume media?' },
  { title: 'AI Assistant vs Human Assistant?', description: 'Assistant preference', optionA: 'AI Assistant', optionB: 'Human Assistant', category: 'Technology', context: 'Which type of help do you prefer?' },
  
  // Lifestyle Category (15 polls)
  { title: 'Morning Person vs Night Owl?', description: 'Sleep schedule', optionA: 'Morning Person', optionB: 'Night Owl', category: 'Lifestyle', context: 'When are you most productive?' },
  { title: 'Cats vs Dogs?', description: 'Pet preference', optionA: 'Cats', optionB: 'Dogs', category: 'Lifestyle', context: 'The ultimate pet debate' },
  { title: 'Beach vs Mountains?', description: 'Vacation destination', optionA: 'Beach', optionB: 'Mountains', category: 'Lifestyle', context: 'Perfect getaway location' },
  { title: 'Summer vs Winter?', description: 'Favorite season', optionA: 'Summer', optionB: 'Winter', category: 'Lifestyle', context: 'Which season brings you joy?' },
  { title: 'City vs Countryside?', description: 'Living preference', optionA: 'City', optionB: 'Countryside', category: 'Lifestyle', context: 'Where would you rather live?' },
  { title: 'Shower vs Bath?', description: 'Bathing preference', optionA: 'Shower', optionB: 'Bath', category: 'Lifestyle', context: 'Your preferred way to get clean' },
  { title: 'Hot Shower vs Cold Shower?', description: 'Shower temperature', optionA: 'Hot', optionB: 'Cold', category: 'Lifestyle', context: 'Which wakes you up better?' },
  { title: 'Early Bird vs Late Sleeper?', description: 'Wake up time', optionA: 'Early Bird', optionB: 'Late Sleeper', category: 'Lifestyle', context: 'Your natural wake-up preference' },
  { title: 'Minimalist vs Maximalist?', description: 'Lifestyle philosophy', optionA: 'Minimalist', optionB: 'Maximalist', category: 'Lifestyle', context: 'Your approach to possessions' },
  { title: 'Introvert vs Extrovert?', description: 'Personality type', optionA: 'Introvert', optionB: 'Extrovert', category: 'Lifestyle', context: 'How do you recharge?' },
  { title: 'Planner vs Spontaneous?', description: 'Life approach', optionA: 'Planner', optionB: 'Spontaneous', category: 'Lifestyle', context: 'How do you approach your day?' },
  { title: 'Early Riser vs Night Person?', description: 'Daily rhythm', optionA: 'Early Riser', optionB: 'Night Person', category: 'Lifestyle', context: 'Your peak energy time' },
  { title: 'Organized vs Messy?', description: 'Living space style', optionA: 'Organized', optionB: 'Messy', category: 'Lifestyle', context: 'How do you keep your space?' },
  { title: 'Fitness Enthusiast vs Couch Potato?', description: 'Activity level', optionA: 'Fitness Enthusiast', optionB: 'Couch Potato', category: 'Lifestyle', context: 'Your preferred activity level' },
  { title: 'Social Media vs Real Life?', description: 'Social interaction preference', optionA: 'Social Media', optionB: 'Real Life', category: 'Lifestyle', context: 'How do you prefer to connect?' },
  
  // Work Category (15 polls)
  { title: 'Work from Home vs Office?', description: 'Work location preference', optionA: 'Work from Home', optionB: 'Office', category: 'Work', context: 'Where are you most productive?' },
  { title: 'Freelance vs Full-time?', description: 'Employment type', optionA: 'Freelance', optionB: 'Full-time', category: 'Work', context: 'Your preferred work arrangement' },
  { title: 'Email vs Slack?', description: 'Communication tool', optionA: 'Email', optionB: 'Slack', category: 'Work', context: 'Which do you prefer for work communication?' },
  { title: 'Meetings vs Deep Work?', description: 'Work style', optionA: 'Meetings', optionB: 'Deep Work', category: 'Work', context: 'How do you get things done?' },
  { title: 'Startup vs Corporate?', description: 'Company size', optionA: 'Startup', optionB: 'Corporate', category: 'Work', context: 'Your preferred work environment' },
  { title: 'Salary vs Equity?', description: 'Compensation preference', optionA: 'Salary', optionB: 'Equity', category: 'Work', context: 'What matters more in compensation?' },
  { title: 'Remote vs Hybrid?', description: 'Work model', optionA: 'Remote', optionB: 'Hybrid', category: 'Work', context: 'Your ideal work arrangement' },
  { title: 'Manager vs Individual Contributor?', description: 'Career path', optionA: 'Manager', optionB: 'IC', category: 'Work', context: 'Which career path appeals to you?' },
  { title: 'Agile vs Waterfall?', description: 'Project management', optionA: 'Agile', optionB: 'Waterfall', category: 'Work', context: 'Your preferred project methodology' },
  { title: '4-day vs 5-day Week?', description: 'Work schedule', optionA: '4-day', optionB: '5-day', category: 'Work', context: 'Ideal work week length' },
  { title: 'Morning Meetings vs Afternoon Meetings?', description: 'Meeting timing', optionA: 'Morning', optionB: 'Afternoon', category: 'Work', context: 'When do you prefer meetings?' },
  { title: 'Solo Work vs Team Collaboration?', description: 'Work preference', optionA: 'Solo Work', optionB: 'Team Collaboration', category: 'Work', context: 'How do you work best?' },
  { title: 'Deadline Pressure vs No Pressure?', description: 'Work style', optionA: 'Deadline Pressure', optionB: 'No Pressure', category: 'Work', context: 'What motivates you more?' },
  { title: 'Open Office vs Private Office?', description: 'Workspace preference', optionA: 'Open Office', optionB: 'Private Office', category: 'Work', context: 'Your ideal workspace setup' },
  { title: 'Fixed Hours vs Flexible Hours?', description: 'Schedule preference', optionA: 'Fixed Hours', optionB: 'Flexible Hours', category: 'Work', context: 'Which schedule works better for you?' },
  
  // Entertainment Category (15 polls)
  { title: 'Netflix vs YouTube?', description: 'Streaming platform', optionA: 'Netflix', optionB: 'YouTube', category: 'Entertainment', context: 'Your go-to streaming service' },
  { title: 'Movies vs TV Series?', description: 'Content format', optionA: 'Movies', optionB: 'TV Series', category: 'Entertainment', context: 'Which format do you prefer?' },
  { title: 'Books vs Movies?', description: 'Story medium', optionA: 'Books', optionB: 'Movies', category: 'Entertainment', context: 'Best way to experience a story' },
  { title: 'Marvel vs DC?', description: 'Superhero universe', optionA: 'Marvel', optionB: 'DC', category: 'Entertainment', context: 'The ultimate superhero debate' },
  { title: 'Gaming vs Reading?', description: 'Leisure activity', optionA: 'Gaming', optionB: 'Reading', category: 'Entertainment', context: 'How do you unwind?' },
  { title: 'PlayStation vs Xbox?', description: 'Gaming console', optionA: 'PlayStation', optionB: 'Xbox', category: 'Entertainment', context: 'Console preference' },
  { title: 'Spotify vs Apple Music?', description: 'Music streaming', optionA: 'Spotify', optionB: 'Apple Music', category: 'Entertainment', context: 'Your music platform of choice' },
  { title: 'Podcasts vs Audiobooks?', description: 'Audio content', optionA: 'Podcasts', optionB: 'Audiobooks', category: 'Entertainment', context: 'What do you listen to?' },
  { title: 'Comedy vs Drama?', description: 'Genre preference', optionA: 'Comedy', optionB: 'Drama', category: 'Entertainment', context: 'Which genre do you prefer?' },
  { title: 'Live Concert vs Studio Album?', description: 'Music experience', optionA: 'Live Concert', optionB: 'Studio Album', category: 'Entertainment', context: 'Best way to experience music' },
  { title: 'Action Movies vs Comedy Movies?', description: 'Movie genre', optionA: 'Action', optionB: 'Comedy', category: 'Entertainment', context: 'Your preferred movie type' },
  { title: 'Binge Watch vs Weekly Episodes?', description: 'Watching style', optionA: 'Binge Watch', optionB: 'Weekly Episodes', category: 'Entertainment', context: 'How do you consume shows?' },
  { title: 'Theater vs Home Viewing?', description: 'Movie experience', optionA: 'Theater', optionB: 'Home', category: 'Entertainment', context: 'Where do you prefer to watch movies?' },
  { title: 'Physical Books vs E-books?', description: 'Reading format', optionA: 'Physical Books', optionB: 'E-books', category: 'Entertainment', context: 'Your preferred reading method' },
  { title: 'Single Player vs Multiplayer Games?', description: 'Gaming preference', optionA: 'Single Player', optionB: 'Multiplayer', category: 'Entertainment', context: 'How do you prefer to game?' },
  
  // Sports Category (10 polls)
  { title: 'Football vs Basketball?', description: 'Favorite sport', optionA: 'Football', optionB: 'Basketball', category: 'Sports', context: 'Which sport is more exciting?' },
  { title: 'Team Sports vs Individual Sports?', description: 'Sport type', optionA: 'Team', optionB: 'Individual', category: 'Sports', context: 'Your preferred sport category' },
  { title: 'Gym vs Home Workout?', description: 'Fitness location', optionA: 'Gym', optionB: 'Home', category: 'Sports', context: 'Where do you prefer to exercise?' },
  { title: 'Running vs Cycling?', description: 'Cardio preference', optionA: 'Running', optionB: 'Cycling', category: 'Sports', context: 'Your preferred cardio exercise' },
  { title: 'Yoga vs Pilates?', description: 'Mind-body exercise', optionA: 'Yoga', optionB: 'Pilates', category: 'Sports', context: 'Which practice do you prefer?' },
  { title: 'Swimming vs Running?', description: 'Endurance sport', optionA: 'Swimming', optionB: 'Running', category: 'Sports', context: 'Best full-body workout' },
  { title: 'Soccer vs American Football?', description: 'Football debate', optionA: 'Soccer', optionB: 'American Football', category: 'Sports', context: 'The football name debate' },
  { title: 'Tennis vs Badminton?', description: 'Racket sport', optionA: 'Tennis', optionB: 'Badminton', category: 'Sports', context: 'Which racket sport is better?' },
  { title: 'Boxing vs MMA?', description: 'Combat sport', optionA: 'Boxing', optionB: 'MMA', category: 'Sports', context: 'The ultimate combat sport' },
  { title: 'Winter Sports vs Summer Sports?', description: 'Seasonal preference', optionA: 'Winter', optionB: 'Summer', category: 'Sports', context: 'Which season has better sports?' },
  
  // Travel Category (10 polls)
  { title: 'Plane vs Train?', description: 'Travel method', optionA: 'Plane', optionB: 'Train', category: 'Travel', context: 'Your preferred mode of long-distance travel' },
  { title: 'Hotel vs Airbnb?', description: 'Accommodation', optionA: 'Hotel', optionB: 'Airbnb', category: 'Travel', context: 'Where do you prefer to stay?' },
  { title: 'Solo Travel vs Group Travel?', description: 'Travel style', optionA: 'Solo', optionB: 'Group', category: 'Travel', context: 'How do you prefer to travel?' },
  { title: 'Adventure vs Relaxation?', description: 'Vacation type', optionA: 'Adventure', optionB: 'Relaxation', category: 'Travel', context: 'Your ideal vacation style' },
  { title: 'Domestic vs International?', description: 'Travel destination', optionA: 'Domestic', optionB: 'International', category: 'Travel', context: 'Where do you prefer to explore?' },
  { title: 'Backpacking vs Luxury?', description: 'Travel budget', optionA: 'Backpacking', optionB: 'Luxury', category: 'Travel', context: 'Your travel style preference' },
  { title: 'Road Trip vs Flight?', description: 'Journey preference', optionA: 'Road Trip', optionB: 'Flight', category: 'Travel', context: 'How do you prefer to get there?' },
  { title: 'Cruise vs Resort?', description: 'Vacation format', optionA: 'Cruise', optionB: 'Resort', category: 'Travel', context: 'Your preferred vacation package' },
  { title: 'Europe vs Asia?', description: 'Continent preference', optionA: 'Europe', optionB: 'Asia', category: 'Travel', context: 'Which continent to explore first?' },
  { title: 'Camping vs Glamping?', description: 'Outdoor experience', optionA: 'Camping', optionB: 'Glamping', category: 'Travel', context: 'Your preferred outdoor stay' },
  
  // Education Category (5 polls)
  { title: 'Online Learning vs In-Person?', description: 'Learning format', optionA: 'Online', optionB: 'In-Person', category: 'Education', context: 'Which learning method works better?' },
  { title: 'STEM vs Humanities?', description: 'Field of study', optionA: 'STEM', optionB: 'Humanities', category: 'Education', context: 'Your preferred academic field' },
  { title: 'Theory vs Practice?', description: 'Learning approach', optionA: 'Theory', optionB: 'Practice', category: 'Education', context: 'How do you learn best?' },
  { title: 'University vs Self-Taught?', description: 'Education path', optionA: 'University', optionB: 'Self-Taught', category: 'Education', context: 'Your preferred learning path' },
  { title: 'Group Study vs Solo Study?', description: 'Study method', optionA: 'Group', optionB: 'Solo', category: 'Education', context: 'How do you study most effectively?' }
]

/**
 * Get random element from array
 */
function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate random expiration time (1 hour to 7 days from now)
 */
function generateExpirationDate(): Date {
  const now = new Date()
  const hoursFromNow = 1 + Math.random() * (7 * 24 - 1) // 1 hour to 7 days
  return new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
}

/**
 * Generate trending score based on poll age and category
 */
function generateTrendingScore(createdAt: Date, category: string): number {
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const baseScore = 50 + Math.random() * 200
  
  // Popular categories get a boost
  const categoryBoost: Record<string, number> = {
    'Food': 1.3,
    'Technology': 1.2,
    'Entertainment': 1.4,
    'Lifestyle': 1.1,
    'Sports': 1.0,
    'Work': 0.9,
    'Travel': 1.0,
    'Education': 0.8
  }
  
  const boost = categoryBoost[category] || 1.0
  return Math.round(baseScore * boost)
}

/**
 * Main function to generate 100 test polls
 */
export async function generate100TestPolls(): Promise<{
  success: boolean
  created: number
  errors: string[]
  details: {
    pollsCreated: number
    categories: Record<string, number>
    usersUsed: string[]
  }
}> {
  console.log('🚀 Starting generation of 100 test polls...')
  
  const result = {
    success: false,
    created: 0,
    errors: [] as string[],
    details: {
      pollsCreated: 0,
      categories: {} as Record<string, number>,
      usersUsed: [] as string[]
    }
  }

  try {
    // Step 1: Fetch existing users from database
    console.log('📋 Step 1: Fetching users from database...')
    const users = await SupabasePollzAPI.getAllUsers()
    
    if (users.length === 0) {
      throw new Error('No users found in database. Please create at least one user first.')
    }
    
    console.log(`✅ Found ${users.length} users in database`)
    result.details.usersUsed = users.map(u => u.username)

    // Step 2: Shuffle poll templates to ensure variety
    console.log('📋 Step 2: Preparing poll templates...')
    const shuffledTemplates = [...pollTemplates]
    for (let i = shuffledTemplates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]]
    }

    // Step 3: Generate exactly 100 polls
    console.log('📋 Step 3: Creating 100 polls...')
    const pollsToCreate = shuffledTemplates.slice(0, 100)
    
    // If we have fewer than 100 templates, repeat some
    while (pollsToCreate.length < 100) {
      const randomTemplate = getRandom(pollTemplates)
      pollsToCreate.push({
        ...randomTemplate,
        title: `${randomTemplate.title} (${pollsToCreate.length + 1})`
      })
    }

    // Step 4: Create polls with progress tracking
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < pollsToCreate.length; i++) {
      const template = pollsToCreate[i]
      const author = getRandom(users)
      const expiresAt = generateExpirationDate()
      const createdAt = new Date()
      
      try {
        // Create poll using Supabase API
        await SupabasePollzAPI.createPoll({
          title: template.title,
          description: template.description,
          category: template.category,
          timeLeft: '', // Will be calculated by the API
          authorId: author.id,
          author: author.name,
          authorUsername: author.username,
          context: template.context || template.description,
          arguments: {
            optionA: template.optionA,
            optionB: template.optionB
          },
          expiresAt: expiresAt,
          isDeathmatch: false, // Regular polls for now
          isShadowDeathmatch: false
        })

        successCount++
        result.details.pollsCreated++
        
        // Track categories
        if (!result.details.categories[template.category]) {
          result.details.categories[template.category] = 0
        }
        result.details.categories[template.category]++

        // Progress update every 10 polls
        if ((i + 1) % 10 === 0) {
          console.log(`  ✅ Created ${i + 1}/100 polls...`)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error: any) {
        errorCount++
        const errorMsg = `Failed to create poll "${template.title}": ${error.message}`
        result.errors.push(errorMsg)
        console.error(`  ❌ ${errorMsg}`)
      }
    }

    // Step 5: Summary
    console.log('\n📊 Generation Summary:')
    console.log(`  ✅ Successfully created: ${successCount} polls`)
    console.log(`  ❌ Errors: ${errorCount} polls`)
    console.log(`  📁 Categories:`)
    Object.entries(result.details.categories).forEach(([category, count]) => {
      console.log(`     - ${category}: ${count} polls`)
    })
    console.log(`  👥 Users used: ${result.details.usersUsed.length} users`)

    result.success = successCount > 0
    result.created = successCount

    if (result.success) {
      console.log('\n🎉 Poll generation completed successfully!')
    } else {
      console.log('\n⚠️ No polls were created. Please check errors above.')
    }

    return result

  } catch (error: any) {
    console.error('❌ Fatal error during poll generation:', error)
    result.errors.push(`Fatal error: ${error.message}`)
    return result
  }
}

// Export for use in browser console or admin panel
if (typeof window !== 'undefined') {
  (window as any).generate100TestPolls = generate100TestPolls
  console.log('💡 generate100TestPolls() is now available in the console!')
  console.log('   Usage: await generate100TestPolls()')
}


