import { PollzAPI } from '../database/api'

// Simple humorous poll templates
const humorousPolls = [
  {
    title: "What's the most overrated food trend?",
    description: "Everyone's talking about it, but is it really that good?",
    category: "Food",
    optionA: "Avocado toast - it's just bread with green stuff",
    optionB: "Kale smoothies - tastes like lawn clippings",
    author: "FoodCritic1"
  },
  {
    title: "Best way to eat pizza?",
    description: "The eternal debate that divides nations",
    category: "Food",
    optionA: "With pineapple (fight me)",
    optionB: "With anchovies (the sophisticated choice)",
    author: "PizzaLover2"
  },
  {
    title: "Most annoying app notification?",
    description: "The one that makes you want to throw your phone",
    category: "Technology",
    optionA: "Weather alerts for rain",
    optionB: "Social media 'you haven't posted in 3 days'",
    author: "TechUser3"
  },
  {
    title: "Best excuse for missing a meeting?",
    description: "When creativity meets desperation",
    category: "Work",
    optionA: "My dog ate my laptop",
    optionB: "I was stuck in traffic (at home)",
    author: "OfficeWorker4"
  },
  {
    title: "Worst first date idea?",
    description: "When you want to make a bad impression",
    category: "Dating",
    optionA: "Movie theater (can't talk)",
    optionB: "Grocery shopping (too practical)",
    author: "DatingExpert5"
  },
  {
    title: "Best way to avoid exercise?",
    description: "When motivation is low",
    category: "Health",
    optionA: "Say you'll start tomorrow",
    optionB: "Blame it on the weather",
    author: "CouchPotato6"
  },
  {
    title: "Most useless kitchen gadget?",
    description: "We all have that drawer full of regrets",
    category: "Food",
    optionA: "Garlic press - just use a knife",
    optionB: "Egg separator - your hands work fine",
    author: "KitchenGuru7"
  },
  {
    title: "Best way to look busy at work?",
    description: "The art of appearing productive",
    category: "Work",
    optionA: "Furrow your brow and nod",
    optionB: "Carry a clipboard everywhere",
    author: "ProductivityHack8"
  },
  {
    title: "Worst pickup line?",
    description: "The one that makes everyone cringe",
    category: "Dating",
    optionA: "Did it hurt when you fell from heaven?",
    optionB: "Are you a parking ticket? Because you've got fine written all over you",
    author: "SmoothTalker9"
  },
  {
    title: "Best way to save money?",
    description: "When your bank account is crying",
    category: "Finance",
    optionA: "Stop buying coffee",
    optionB: "Stop buying avocado toast",
    author: "MoneySaver10"
  },
  {
    title: "Most annoying social media trend?",
    description: "The one that makes you want to delete the app",
    category: "Social Media",
    optionA: "Dance challenges",
    optionB: "Food photos with filters",
    author: "SocialMediaHater11"
  },
  {
    title: "Best way to pack for travel?",
    description: "The eternal struggle of fitting everything",
    category: "Travel",
    optionA: "Roll everything",
    optionB: "Fold everything perfectly",
    author: "TravelExpert12"
  },
  {
    title: "Worst gym equipment?",
    description: "The one that collects dust",
    category: "Health",
    optionA: "The ab roller",
    optionB: "The thigh master",
    author: "GymRat13"
  },
  {
    title: "Best way to avoid small talk?",
    description: "When you want to skip the pleasantries",
    category: "Communication",
    optionA: "Go straight to the point",
    optionB: "Ask deep questions immediately",
    author: "ConversationStarter14"
  },
  {
    title: "Most useless subscription?",
    description: "The one you forgot you had",
    category: "Finance",
    optionA: "Gym membership (you never go)",
    optionB: "Magazine subscription (you never read)",
    author: "SubscriptionHoarder15"
  },
  {
    title: "Best way to eat ice cream?",
    description: "When you need comfort food",
    category: "Food",
    optionA: "With a spoon",
    optionB: "With a fork",
    author: "IceCreamLover16"
  },
  {
    title: "Worst autocorrect fail?",
    description: "When your phone has a mind of its own",
    category: "Technology",
    optionA: "Duck becomes something else",
    optionB: "Thanks becomes tanks",
    author: "AutoCorrectVictim17"
  },
  {
    title: "Best way to avoid being late?",
    description: "When time management is hard",
    category: "Time Management",
    optionA: "Set all clocks 10 minutes fast",
    optionB: "Leave 30 minutes early",
    author: "TimeOptimist18"
  },
  {
    title: "Most annoying pet habit?",
    description: "The one that makes you question your life choices",
    category: "Pets",
    optionA: "Begging for food",
    optionB: "Sleeping on your pillow",
    author: "PetParent19"
  },
  {
    title: "Best way to make money?",
    description: "When you need some extra cash",
    category: "Finance",
    optionA: "Sell your old stuff",
    optionB: "Get a side hustle",
    author: "MoneyMaker20"
  }
]

// Populate database with humorous polls
export const populateHumorousPolls = async () => {
  console.log('🎭 Starting humorous polls population...')
  
  try {
    let addedCount = 0
    
    for (const pollTemplate of humorousPolls) {
      try {
        await PollzAPI.createPoll({
          title: pollTemplate.title,
          description: pollTemplate.description,
          category: pollTemplate.category,
          timeLeft: `${Math.floor(Math.random() * 7) + 1} days left`,
          authorId: pollTemplate.author.toLowerCase(),
          author: pollTemplate.author,
          context: pollTemplate.description,
          arguments: {
            optionA: pollTemplate.optionA,
            optionB: pollTemplate.optionB
          },
          expiresAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        })
        
        addedCount++
        console.log(`✅ Added: ${pollTemplate.title}`)
        
        // Add some random votes to make it realistic
        const pollId = `poll-${Date.now()}-${Math.random()}`
        const votesA = Math.floor(Math.random() * 50) + 5
        const votesB = Math.floor(Math.random() * 50) + 5
        
        for (let i = 0; i < votesA; i++) {
          try {
            await PollzAPI.voteOnPoll(pollId, `voter_${i}_A`, 'A')
          } catch (e) {
            // Ignore vote errors for demo
          }
        }
        
        for (let i = 0; i < votesB; i++) {
          try {
            await PollzAPI.voteOnPoll(pollId, `voter_${i}_B`, 'B')
          } catch (e) {
            // Ignore vote errors for demo
          }
        }
        
      } catch (error) {
        console.error(`❌ Error adding poll: ${pollTemplate.title}`, error)
      }
    }
    
    console.log(`🎉 Successfully added ${addedCount} humorous polls!`)
    console.log('📊 Categories:', [...new Set(humorousPolls.map(p => p.category))])
    
  } catch (error) {
    console.error('❌ Error populating humorous polls:', error)
  }
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    populateHumorousPolls()
  }, 1000)
}
