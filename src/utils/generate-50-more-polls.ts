// Generate 50 additional polls for development
import { db, Poll } from '../database/simple-db'

export async function generate50MorePolls() {
  const data = await db.read()
  
  // Get Admin user and other users
  const adminUser = data.users.find(u => u.role === 'admin')
  const otherUsers = data.users.filter(u => u.role !== 'admin' && u.id !== 'admin-1')
  
  if (!adminUser) {
    console.error('Admin user not found!')
    return
  }

  const categories = ['Food', 'Animals', 'Lifestyle', 'Technology', 'Social', 'Work', 'Entertainment', 'Sports']
  
  // Poll templates for variety
  const pollTemplates = [
    { title: 'Coffee or Tea in the morning?', desc: 'The ultimate morning beverage debate', optionA: 'Coffee', optionB: 'Tea', category: 'Food' },
    { title: 'Work from home or office?', desc: 'Where do you get more done?', optionA: 'Home', optionB: 'Office', category: 'Work' },
    { title: 'iPhone or Android?', desc: 'The eternal smartphone debate', optionA: 'iPhone', optionB: 'Android', category: 'Technology' },
    { title: 'Summer or Winter?', desc: 'Which season is superior?', optionA: 'Summer', optionB: 'Winter', category: 'Lifestyle' },
    { title: 'Books or Movies?', desc: 'Best way to experience a story', optionA: 'Books', optionB: 'Movies', category: 'Entertainment' },
    { title: 'Early bird or night owl?', desc: 'When are you most productive?', optionA: 'Early bird', optionB: 'Night owl', category: 'Lifestyle' },
    { title: 'Beach or Mountains?', desc: 'Perfect vacation destination', optionA: 'Beach', optionB: 'Mountains', category: 'Lifestyle' },
    { title: 'Pizza or Burger?', desc: 'Fast food showdown', optionA: 'Pizza', optionB: 'Burger', category: 'Food' },
    { title: 'Marvel or DC?', desc: 'Superhero universe supremacy', optionA: 'Marvel', optionB: 'DC', category: 'Entertainment' },
    { title: 'Spotify or Apple Music?', desc: 'Music streaming service battle', optionA: 'Spotify', optionB: 'Apple Music', category: 'Technology' },
    { title: 'Chocolate or Vanilla?', desc: 'Classic ice cream flavors', optionA: 'Chocolate', optionB: 'Vanilla', category: 'Food' },
    { title: 'Shower at night or morning?', desc: 'Best time to shower', optionA: 'Night', optionB: 'Morning', category: 'Lifestyle' },
    { title: 'Text or Call?', desc: 'Preferred communication method', optionA: 'Text', optionB: 'Call', category: 'Social' },
    { title: 'Windows or Mac?', desc: 'Operating system preference', optionA: 'Windows', optionB: 'Mac', category: 'Technology' },
    { title: 'Cake or Pie?', desc: 'Dessert debate', optionA: 'Cake', optionB: 'Pie', category: 'Food' },
    { title: 'Football or Basketball?', desc: 'Which sport is more exciting?', optionA: 'Football', optionB: 'Basketball', category: 'Sports' },
    { title: 'Email or Slack?', desc: 'Better workplace communication', optionA: 'Email', optionB: 'Slack', category: 'Work' },
    { title: 'Save money or travel?', desc: 'Financial priorities', optionA: 'Save', optionB: 'Travel', category: 'Lifestyle' },
    { title: 'Gaming console or PC?', desc: 'Ultimate gaming platform', optionA: 'Console', optionB: 'PC', category: 'Entertainment' },
    { title: 'Hot dog: sandwich or not?', desc: 'The philosophical question', optionA: 'Sandwich', optionB: 'Not sandwich', category: 'Food' },
    { title: 'City life or countryside?', desc: 'Where would you rather live?', optionA: 'City', optionB: 'Countryside', category: 'Lifestyle' },
    { title: 'Online shopping or in-store?', desc: 'Shopping preference', optionA: 'Online', optionB: 'In-store', category: 'Social' },
    { title: 'Comedy or Drama shows?', desc: 'What do you binge?', optionA: 'Comedy', optionB: 'Drama', category: 'Entertainment' },
    { title: 'Pancakes or Waffles?', desc: 'Breakfast battle', optionA: 'Pancakes', optionB: 'Waffles', category: 'Food' },
    { title: 'Work hard or work smart?', desc: 'Path to success', optionA: 'Work hard', optionB: 'Work smart', category: 'Work' },
    { title: 'Manual or Automatic car?', desc: 'Driving preference', optionA: 'Manual', optionB: 'Automatic', category: 'Lifestyle' },
    { title: 'Cats or Dogs as pets?', desc: 'Best companion animal', optionA: 'Cats', optionB: 'Dogs', category: 'Animals' },
    { title: 'Netflix or YouTube?', desc: 'Streaming platform preference', optionA: 'Netflix', optionB: 'YouTube', category: 'Entertainment' },
    { title: 'Pasta or Rice?', desc: 'Carb of choice', optionA: 'Pasta', optionB: 'Rice', category: 'Food' },
    { title: 'Gym or Home workout?', desc: 'Exercise preference', optionA: 'Gym', optionB: 'Home', category: 'Lifestyle' },
    { title: 'Fiction or Non-fiction books?', desc: 'Reading preference', optionA: 'Fiction', optionB: 'Non-fiction', category: 'Entertainment' },
    { title: 'Salty or Sweet snacks?', desc: 'Snacking preference', optionA: 'Salty', optionB: 'Sweet', category: 'Food' },
    { title: 'Morning person or not?', desc: 'Natural rhythm', optionA: 'Yes', optionB: 'No', category: 'Lifestyle' },
    { title: 'Paper books or E-books?', desc: 'Reading format', optionA: 'Paper', optionB: 'E-books', category: 'Technology' },
    { title: 'Solo travel or group travel?', desc: 'Travel style', optionA: 'Solo', optionB: 'Group', category: 'Lifestyle' },
    { title: 'Ketchup or Mustard?', desc: 'Condiment choice', optionA: 'Ketchup', optionB: 'Mustard', category: 'Food' },
    { title: 'Loud music or quiet ambience?', desc: 'Working environment', optionA: 'Loud music', optionB: 'Quiet', category: 'Work' },
    { title: 'Video call or phone call?', desc: 'Remote communication', optionA: 'Video', optionB: 'Phone', category: 'Social' },
    { title: 'Breakfast or Dinner?', desc: 'Most important meal', optionA: 'Breakfast', optionB: 'Dinner', category: 'Food' },
    { title: 'Reading or Writing?', desc: 'Creative preference', optionA: 'Reading', optionB: 'Writing', category: 'Entertainment' },
    { title: 'Plan ahead or go with flow?', desc: 'Life philosophy', optionA: 'Plan', optionB: 'Go with flow', category: 'Lifestyle' },
    { title: 'Desktop or Laptop?', desc: 'Computer preference', optionA: 'Desktop', optionB: 'Laptop', category: 'Technology' },
    { title: 'Comedy or Horror movies?', desc: 'Movie genre', optionA: 'Comedy', optionB: 'Horror', category: 'Entertainment' },
    { title: 'Salad or Soup?', desc: 'Healthy meal choice', optionA: 'Salad', optionB: 'Soup', category: 'Food' },
    { title: 'Freelance or Full-time job?', desc: 'Work style preference', optionA: 'Freelance', optionB: 'Full-time', category: 'Work' },
    { title: 'Public transport or own car?', desc: 'Transportation method', optionA: 'Public', optionB: 'Own car', category: 'Lifestyle' },
    { title: 'Action or Strategy games?', desc: 'Gaming preference', optionA: 'Action', optionB: 'Strategy', category: 'Entertainment' },
    { title: 'Texting emojis or words only?', desc: 'Texting style', optionA: 'Emojis', optionB: 'Words only', category: 'Social' },
    { title: 'Instagram or TikTok?', desc: 'Social media preference', optionA: 'Instagram', optionB: 'TikTok', category: 'Social' },
    { title: 'Minimalist or Maximalist lifestyle?', desc: 'Living philosophy', optionA: 'Minimalist', optionB: 'Maximalist', category: 'Lifestyle' }
  ]

  const newPolls: Poll[] = []
  
  // Create 25 polls for Admin
  for (let i = 0; i < 25; i++) {
    const template = pollTemplates[i]
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days
    
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    const poll: Poll = {
      id: `poll-${Date.now()}-${i}`,
      title: template.title,
      description: template.desc,
      votes: Math.floor(Math.random() * 500),
      votesOptionA: 0,
      votesOptionB: 0,
      category: template.category,
      timeLeft: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
      authorId: adminUser.id,
      author: adminUser.name,
      isVoted: false,
      isLiked: false,
      createdAt: new Date(),
      expiresAt: expiresAt,
      context: `Let's settle this debate once and for all!`,
      arguments: {
        optionA: `${template.optionA} is clearly superior for obvious reasons`,
        optionB: `${template.optionB} is the better choice without question`
      },
      evidence: {
        optionA: [],
        optionB: []
      },
      comments: [],
      trendingScore: Math.random() * 100,
      pollType: 'question',
      timerEnabled: true,
      notificationEnabled: false,
      isExpired: false,
      debateHistory: {
        creatorWins: 0,
        opponentWins: 0,
        totalDebates: 0
      }
    }
    
    // Distribute votes
    poll.votesOptionA = Math.floor(poll.votes * (0.3 + Math.random() * 0.4))
    poll.votesOptionB = poll.votes - poll.votesOptionA
    
    newPolls.push(poll)
  }
  
  // Create 25 polls for other users
  for (let i = 25; i < 50; i++) {
    const template = pollTemplates[i]
    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)] || adminUser
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days
    
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    const poll: Poll = {
      id: `poll-${Date.now()}-${i}`,
      title: template.title,
      description: template.desc,
      votes: Math.floor(Math.random() * 300),
      votesOptionA: 0,
      votesOptionB: 0,
      category: template.category,
      timeLeft: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
      authorId: randomUser.id,
      author: randomUser.name,
      isVoted: false,
      isLiked: false,
      createdAt: new Date(),
      expiresAt: expiresAt,
      context: `I need your opinion on this!`,
      arguments: {
        optionA: `${template.optionA} for the win`,
        optionB: `${template.optionB} all the way`
      },
      evidence: {
        optionA: [],
        optionB: []
      },
      comments: [],
      trendingScore: Math.random() * 80,
      pollType: 'question',
      timerEnabled: true,
      notificationEnabled: false,
      isExpired: false,
      debateHistory: {
        creatorWins: 0,
        opponentWins: 0,
        totalDebates: 0
      }
    }
    
    // Distribute votes
    poll.votesOptionA = Math.floor(poll.votes * (0.3 + Math.random() * 0.4))
    poll.votesOptionB = poll.votes - poll.votesOptionA
    
    newPolls.push(poll)
  }
  
  // Add all new polls to database
  data.polls.push(...newPolls)
  
  // Update user poll counts
  const adminPollCount = data.polls.filter(p => p.authorId === adminUser.id).length
  adminUser.pollCount = adminPollCount
  
  otherUsers.forEach(user => {
    const userPollCount = data.polls.filter(p => p.authorId === user.id).length
    user.pollCount = userPollCount
  })
  
  await db.write()
  
  console.log(`✅ Generated 50 additional polls:`)
  console.log(`   • 25 polls for ${adminUser.name} (Admin)`)
  console.log(`   • 25 polls distributed among other users`)
  console.log(`   • Total polls in database: ${data.polls.length}`)
  
  return newPolls
}

// Auto-run if in development
if (process.env.NODE_ENV === 'development') {
  // Make function available in console
  (window as any).generate50MorePolls = generate50MorePolls
  console.log('💡 Run generate50MorePolls() in console to add 50 more polls')
}

