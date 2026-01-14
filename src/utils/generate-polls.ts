// Utility to generate diverse polls for the database
import { Poll } from '../database/simple-db'

interface PollTemplate {
  title: string
  optionA: string
  optionB: string
  context: string
}

const pollTemplates: Record<string, PollTemplate[]> = {
  Food: [
    { title: 'Pizza vs Burgers?', optionA: 'Pizza', optionB: 'Burgers', context: 'The ultimate fast food showdown' },
    { title: 'Coffee vs Tea?', optionA: 'Coffee', optionB: 'Tea', context: 'Morning beverage debate' },
    { title: 'Sushi vs Tacos?', optionA: 'Sushi', optionB: 'Tacos', context: 'International cuisine battle' },
    { title: 'Chocolate vs Vanilla?', optionA: 'Chocolate', optionB: 'Vanilla', context: 'Classic ice cream flavors' },
    { title: 'Breakfast vs Dinner?', optionA: 'Breakfast', optionB: 'Dinner', context: 'Best meal of the day' },
    { title: 'Sweet vs Savory?', optionA: 'Sweet', optionB: 'Savory', context: 'Taste preference' },
    { title: 'Hot Dogs vs Sandwiches?', optionA: 'Hot Dogs', optionB: 'Sandwiches', context: 'Lunch debate' },
    { title: 'Pasta vs Rice?', optionA: 'Pasta', optionB: 'Rice', context: 'Carb preference' },
    { title: 'Steak vs Chicken?', optionA: 'Steak', optionB: 'Chicken', context: 'Protein choice' },
    { title: 'Pineapple on Pizza?', optionA: 'Yes, delicious!', optionB: 'No, never!', context: 'The most controversial food debate' }
  ],
  Technology: [
    { title: 'iOS vs Android?', optionA: 'iOS', optionB: 'Android', context: 'Mobile OS preference' },
    { title: 'Mac vs PC?', optionA: 'Mac', optionB: 'PC', context: 'Computer platform debate' },
    { title: 'Tabs vs Spaces?', optionA: 'Tabs', optionB: 'Spaces', context: 'Code indentation holy war' },
    { title: 'Dark Mode vs Light Mode?', optionA: 'Dark Mode', optionB: 'Light Mode', context: 'UI theme preference' },
    { title: 'Chrome vs Firefox?', optionA: 'Chrome', optionB: 'Firefox', context: 'Browser choice' },
    { title: 'TypeScript vs JavaScript?', optionA: 'TypeScript', optionB: 'JavaScript', context: 'Programming language' },
    { title: 'React vs Vue?', optionA: 'React', optionB: 'Vue', context: 'Frontend framework' },
    { title: 'Git vs SVN?', optionA: 'Git', optionB: 'SVN', context: 'Version control' },
    { title: 'Windows vs Linux?', optionA: 'Windows', optionB: 'Linux', context: 'Operating system' },
    { title: 'Wireless vs Wired?', optionA: 'Wireless', optionB: 'Wired', context: 'Connectivity preference' }
  ],
  Lifestyle: [
    { title: 'Morning Person vs Night Owl?', optionA: 'Morning Person', optionB: 'Night Owl', context: 'Sleep schedule' },
    { title: 'Cats vs Dogs?', optionA: 'Cats', optionB: 'Dogs', context: 'Pet preference' },
    { title: 'Beach vs Mountains?', optionA: 'Beach', optionB: 'Mountains', context: 'Vacation destination' },
    { title: 'Summer vs Winter?', optionA: 'Summer', optionB: 'Winter', context: 'Favorite season' },
    { title: 'City vs Countryside?', optionA: 'City', optionB: 'Countryside', context: 'Living preference' },
    { title: 'Shower vs Bath?', optionA: 'Shower', optionB: 'Bath', context: 'Bathing preference' },
    { title: 'Hot Shower vs Cold Shower?', optionA: 'Hot', optionB: 'Cold', context: 'Shower temperature' },
    { title: 'Early Bird vs Late Sleeper?', optionA: 'Early Bird', optionB: 'Late Sleeper', context: 'Wake up time' },
    { title: 'Minimalist vs Maximalist?', optionA: 'Minimalist', optionB: 'Maximalist', context: 'Lifestyle philosophy' },
    { title: 'Introvert vs Extrovert?', optionA: 'Introvert', optionB: 'Extrovert', context: 'Personality type' }
  ],
  Work: [
    { title: 'Work from Home vs Office?', optionA: 'Work from Home', optionB: 'Office', context: 'Work location preference' },
    { title: 'Freelance vs Full-time?', optionA: 'Freelance', optionB: 'Full-time', context: 'Employment type' },
    { title: 'Email vs Slack?', optionA: 'Email', optionB: 'Slack', context: 'Communication tool' },
    { title: 'Meetings vs Deep Work?', optionA: 'Meetings', optionB: 'Deep Work', context: 'Work style' },
    { title: 'Startup vs Corporate?', optionA: 'Startup', optionB: 'Corporate', context: 'Company size' },
    { title: 'Salary vs Equity?', optionA: 'Salary', optionB: 'Equity', context: 'Compensation preference' },
    { title: 'Remote vs Hybrid?', optionA: 'Remote', optionB: 'Hybrid', context: 'Work model' },
    { title: 'Manager vs Individual Contributor?', optionA: 'Manager', optionB: 'IC', context: 'Career path' },
    { title: 'Agile vs Waterfall?', optionA: 'Agile', optionB: 'Waterfall', context: 'Project management' },
    { title: '4-day vs 5-day Week?', optionA: '4-day', optionB: '5-day', context: 'Work schedule' }
  ],
  Entertainment: [
    { title: 'Netflix vs YouTube?', optionA: 'Netflix', optionB: 'YouTube', context: 'Streaming platform' },
    { title: 'Movies vs TV Series?', optionA: 'Movies', optionB: 'TV Series', context: 'Content format' },
    { title: 'Books vs Movies?', optionA: 'Books', optionB: 'Movies', context: 'Story medium' },
    { title: 'Marvel vs DC?', optionA: 'Marvel', optionB: 'DC', context: 'Superhero universe' },
    { title: 'Gaming vs Reading?', optionA: 'Gaming', optionB: 'Reading', context: 'Leisure activity' },
    { title: 'PlayStation vs Xbox?', optionA: 'PlayStation', optionB: 'Xbox', context: 'Gaming console' },
    { title: 'Spotify vs Apple Music?', optionA: 'Spotify', optionB: 'Apple Music', context: 'Music streaming' },
    { title: 'Podcasts vs Audiobooks?', optionA: 'Podcasts', optionB: 'Audiobooks', context: 'Audio content' },
    { title: 'Comedy vs Drama?', optionA: 'Comedy', optionB: 'Drama', context: 'Genre preference' },
    { title: 'Live Concert vs Studio Album?', optionA: 'Live Concert', optionB: 'Studio Album', context: 'Music experience' }
  ],
  Sports: [
    { title: 'Football vs Basketball?', optionA: 'Football', optionB: 'Basketball', context: 'Favorite sport' },
    { title: 'Team Sports vs Individual Sports?', optionA: 'Team', optionB: 'Individual', context: 'Sport type' },
    { title: 'Gym vs Home Workout?', optionA: 'Gym', optionB: 'Home', context: 'Fitness location' },
    { title: 'Running vs Cycling?', optionA: 'Running', optionB: 'Cycling', context: 'Cardio preference' },
    { title: 'Yoga vs Pilates?', optionA: 'Yoga', optionB: 'Pilates', context: 'Mind-body exercise' },
    { title: 'Swimming vs Running?', optionA: 'Swimming', optionB: 'Running', context: 'Endurance sport' },
    { title: 'Soccer vs American Football?', optionA: 'Soccer', optionB: 'American Football', context: 'Football debate' },
    { title: 'Tennis vs Badminton?', optionA: 'Tennis', optionB: 'Badminton', context: 'Racket sport' },
    { title: 'Boxing vs MMA?', optionA: 'Boxing', optionB: 'MMA', context: 'Combat sport' },
    { title: 'Winter Sports vs Summer Sports?', optionA: 'Winter', optionB: 'Summer', context: 'Seasonal preference' }
  ],
  Travel: [
    { title: 'Plane vs Train?', optionA: 'Plane', optionB: 'Train', context: 'Travel method' },
    { title: 'Hotel vs Airbnb?', optionA: 'Hotel', optionB: 'Airbnb', context: 'Accommodation' },
    { title: 'Solo Travel vs Group Travel?', optionA: 'Solo', optionB: 'Group', context: 'Travel style' },
    { title: 'Adventure vs Relaxation?', optionA: 'Adventure', optionB: 'Relaxation', context: 'Vacation type' },
    { title: 'Domestic vs International?', optionA: 'Domestic', optionB: 'International', context: 'Travel destination' },
    { title: 'Backpacking vs Luxury?', optionA: 'Backpacking', optionB: 'Luxury', context: 'Travel budget' },
    { title: 'Road Trip vs Flight?', optionA: 'Road Trip', optionB: 'Flight', context: 'Journey preference' },
    { title: 'Cruise vs Resort?', optionA: 'Cruise', optionB: 'Resort', context: 'Vacation format' },
    { title: 'Europe vs Asia?', optionA: 'Europe', optionB: 'Asia', context: 'Continent preference' },
    { title: 'Camping vs Glamping?', optionA: 'Camping', optionB: 'Glamping', context: 'Outdoor experience' }
  ],
  Education: [
    { title: 'Online Learning vs In-Person?', optionA: 'Online', optionB: 'In-Person', context: 'Learning format' },
    { title: 'STEM vs Humanities?', optionA: 'STEM', optionB: 'Humanities', context: 'Field of study' },
    { title: 'Theory vs Practice?', optionA: 'Theory', optionB: 'Practice', context: 'Learning approach' },
    { title: 'University vs Self-Taught?', optionA: 'University', optionB: 'Self-Taught', context: 'Education path' },
    { title: 'Group Study vs Solo Study?', optionA: 'Group', optionB: 'Solo', context: 'Study method' },
    { title: 'Morning Classes vs Evening Classes?', optionA: 'Morning', optionB: 'Evening', context: 'Class schedule' },
    { title: 'Textbooks vs Videos?', optionA: 'Textbooks', optionB: 'Videos', context: 'Learning material' },
    { title: 'Lecture vs Discussion?', optionA: 'Lecture', optionB: 'Discussion', context: 'Teaching style' },
    { title: 'Exams vs Projects?', optionA: 'Exams', optionB: 'Projects', context: 'Assessment method' },
    { title: 'Public School vs Private School?', optionA: 'Public', optionB: 'Private', context: 'School type' }
  ]
}

const authors = ['Admin', 'Alex Johnson', 'Sarah Chen']
const authorIds = ['admin-1', 'user-1', 'user-2']

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateVotes(isHot: boolean = false): { optionA: number; optionB: number } {
  if (isHot) {
    // Close race: 45-55% split
    const optionA = 45 + Math.floor(Math.random() * 11)
    return { optionA, optionB: 100 - optionA }
  } else {
    // Random distribution
    const optionA = 10 + Math.floor(Math.random() * 81)
    return { optionA, optionB: 100 - optionA }
  }
}

function getTimeLeft(minutes: number): string {
  if (minutes < 60) return `${minutes}m left`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h left`
  const days = Math.floor(hours / 24)
  return `${days}d left`
}

export function generate50Polls(): Poll[] {
  const polls: Poll[] = []
  const categories = Object.keys(pollTemplates)
  
  // Time ranges for different poll types
  const timeRanges = [
    { min: 15, max: 45, unit: 'm' },      // 15-45 minutes (HOT polls)
    { min: 1, max: 3, unit: 'h' },        // 1-3 hours
    { min: 4, max: 12, unit: 'h' },       // 4-12 hours
    { min: 1, max: 3, unit: 'd' },        // 1-3 days
    { min: 4, max: 7, unit: 'd' }         // 4-7 days
  ]
  
  // Flatten all templates into a single array to ensure we use all of them
  const allTemplates: Array<{ template: PollTemplate; category: string }> = []
  categories.forEach(category => {
    pollTemplates[category].forEach(template => {
      allTemplates.push({ template, category })
    })
  })
  
  // Shuffle the templates
  for (let i = allTemplates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTemplates[i], allTemplates[j]] = [allTemplates[j], allTemplates[i]]
  }
  
  console.log(`📊 Total available templates: ${allTemplates.length}`)
  
  // Create exactly 50 polls (or all available templates if less than 50)
  const pollCount = Math.min(50, allTemplates.length)
  
  // Create 5 HOT polls from the first 5 templates
  for (let i = 0; i < Math.min(5, pollCount); i++) {
    const { template, category } = allTemplates[i]
    const minutes = 15 + Math.floor(Math.random() * 30) // 15-45 minutes
    const votes = generateVotes(true)
    const authorIndex = Math.floor(Math.random() * authors.length)
    
    polls.push({
      id: `poll-hot-${i + 1}`,
      title: template.title,
      description: template.context,
      category: category,
      authorId: authorIds[authorIndex],
      author: authors[authorIndex],
      votesOptionA: votes.optionA,
      votesOptionB: votes.optionB,
      votes: 100,
      timeLeft: getTimeLeft(minutes),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
      isVoted: false,
      isLiked: false,
      isExpired: false,
      pollType: 'options-only',
      timerEnabled: true,
      timerDuration: minutes,
      notificationEnabled: true,
      context: template.context,
      arguments: {
        optionA: template.optionA,
        optionB: template.optionB
      },
      evidence: { optionA: [], optionB: [] },
      comments: [],
      trendingScore: 200 + Math.floor(Math.random() * 100)
    })
  }
  
  // Create remaining polls from shuffled templates
  for (let i = 5; i < pollCount; i++) {
    const { template, category } = allTemplates[i]
    const timeRange = getRandom(timeRanges)
    
    let minutes: number
    if (timeRange.unit === 'm') {
      minutes = timeRange.min + Math.floor(Math.random() * (timeRange.max - timeRange.min))
    } else if (timeRange.unit === 'h') {
      minutes = (timeRange.min + Math.floor(Math.random() * (timeRange.max - timeRange.min))) * 60
    } else { // days
      minutes = (timeRange.min + Math.floor(Math.random() * (timeRange.max - timeRange.min))) * 24 * 60
    }
    
    const votes = generateVotes(false)
    const authorIndex = Math.floor(Math.random() * authors.length)
    
    polls.push({
      id: `poll-${i + 1}`,
      title: template.title,
      description: template.context,
      category: category,
      authorId: authorIds[authorIndex],
      author: authors[authorIndex],
      votesOptionA: votes.optionA,
      votesOptionB: votes.optionB,
      votes: 100,
      timeLeft: getTimeLeft(minutes),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
      isVoted: false,
      isLiked: false,
      isExpired: false,
      pollType: 'options-only',
      timerEnabled: true,
      timerDuration: minutes,
      notificationEnabled: Math.random() > 0.5,
      context: template.context,
      arguments: {
        optionA: template.optionA,
        optionB: template.optionB
      },
      evidence: { optionA: [], optionB: [] },
      comments: [],
      trendingScore: 50 + Math.floor(Math.random() * 250)
    })
  }
  
  console.log(`✅ Generated ${polls.length} unique polls`)
  return polls
}

