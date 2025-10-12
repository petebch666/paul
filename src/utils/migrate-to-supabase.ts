import { supabase, isSupabaseConfigured } from '../database/supabase'

interface MigrationResult {
  success: boolean
  message: string
  details: {
    usersCreated: number
    pollsCreated: number
    votesCreated: number
    errors: string[]
  }
}

/**
 * Migrate data from localStorage to Supabase
 * This is a one-time migration script
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    message: '',
    details: {
      usersCreated: 0,
      pollsCreated: 0,
      votesCreated: 0,
      errors: []
    }
  }

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      result.message = '⚠️ Supabase is not configured. Please add credentials to .supaenv file.'
      result.details.errors.push('Missing Supabase configuration')
      return result
    }

    console.log('🚀 Starting migration from localStorage to Supabase...')

    // Get data from localStorage
    const localData = localStorage.getItem('paul-db')
    if (!localData) {
      result.message = '⚠️ No local data found to migrate'
      return result
    }

    const data = JSON.parse(localData)
    console.log('📦 Found local data:', {
      users: data.users?.length || 0,
      polls: data.polls?.length || 0,
      votes: data.votes?.length || 0
    })

    // Confirm migration
    const confirmed = confirm(
      `🔄 MIGRATION CONFIRMATION\n\n` +
      `This will migrate your localStorage data to Supabase:\n\n` +
      `• ${data.users?.length || 0} users\n` +
      `• ${data.polls?.length || 0} polls\n` +
      `• ${data.votes?.length || 0} votes\n\n` +
      `Make sure you have:\n` +
      `1. Created a Supabase project\n` +
      `2. Run the SQL schema in Supabase SQL Editor\n` +
      `3. Added credentials to .supaenv file\n\n` +
      `Continue with migration?`
    )

    if (!confirmed) {
      result.message = 'Migration cancelled by user'
      return result
    }

    // Step 1: Migrate Users
    console.log('👥 Migrating users...')
    const userIdMap = new Map<string, string>() // old ID -> new UUID

    for (const user of data.users || []) {
      try {
        // Skip if user already exists (by email)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (existingUser) {
          console.log(`  ↪️ User ${user.email} already exists, skipping`)
          userIdMap.set(user.id, existingUser.id)
          continue
        }

        // Insert new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            password_hash: user.password,
            role: user.role || 'user',
            followers: user.followers || 0,
            following: user.following || 0,
            reputation: user.reputation || 0,
            poll_count: user.pollCount || 0,
            win_rate: user.winRate || 0,
            join_date: user.joinDate ? new Date(user.joinDate) : new Date()
          })
          .select('id')
          .single()

        if (error) {
          console.error(`  ❌ Error migrating user ${user.email}:`, error)
          result.details.errors.push(`User ${user.email}: ${error.message}`)
        } else {
          userIdMap.set(user.id, newUser.id)
          result.details.usersCreated++
          console.log(`  ✅ Migrated user: ${user.email}`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error migrating user ${user.email}:`, error)
        result.details.errors.push(`User ${user.email}: ${error.message}`)
      }
    }

    // Step 2: Migrate Polls
    console.log('📊 Migrating polls...')
    const pollIdMap = new Map<string, string>() // old ID -> new UUID

    for (const poll of data.polls || []) {
      try {
        // Get new author ID
        const newAuthorId = userIdMap.get(poll.authorId)
        if (!newAuthorId) {
          console.warn(`  ⚠️ Author not found for poll: ${poll.title}`)
          result.details.errors.push(`Poll "${poll.title}": Author not found`)
          continue
        }

        // Insert new poll
        const { data: newPoll, error } = await supabase
          .from('polls')
          .insert({
            title: poll.title,
            description: poll.description,
            category: poll.category,
            author_id: newAuthorId,
            author_name: poll.author,
            option_a: poll.arguments?.optionA || 'Option A',
            option_b: poll.arguments?.optionB || 'Option B',
            context: poll.context,
            votes: poll.votes || 0,
            votes_option_a: poll.votesOptionA || 0,
            votes_option_b: poll.votesOptionB || 0,
            is_expired: poll.isExpired || false,
            expires_at: poll.expiresAt ? new Date(poll.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            created_at: poll.createdAt ? new Date(poll.createdAt) : new Date(),
            trending_score: poll.trendingScore || 0,
            poll_type: poll.pollType || 'question',
            timer_enabled: poll.timerEnabled !== undefined ? poll.timerEnabled : true,
            notification_enabled: poll.notificationEnabled !== undefined ? poll.notificationEnabled : false
          })
          .select('id')
          .single()

        if (error) {
          console.error(`  ❌ Error migrating poll ${poll.title}:`, error)
          result.details.errors.push(`Poll "${poll.title}": ${error.message}`)
        } else {
          pollIdMap.set(poll.id, newPoll.id)
          result.details.pollsCreated++
          console.log(`  ✅ Migrated poll: ${poll.title}`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error migrating poll ${poll.title}:`, error)
        result.details.errors.push(`Poll "${poll.title}": ${error.message}`)
      }
    }

    // Step 3: Migrate Votes
    console.log('🗳️ Migrating votes...')

    for (const vote of data.votes || []) {
      try {
        // Get new IDs
        const newPollId = pollIdMap.get(vote.pollId)
        const newUserId = userIdMap.get(vote.userId)

        if (!newPollId || !newUserId) {
          console.warn(`  ⚠️ Missing reference for vote: poll ${newPollId ? 'found' : 'missing'}, user ${newUserId ? 'found' : 'missing'}`)
          continue
        }

        // Insert new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            poll_id: newPollId,
            user_id: newUserId,
            option: vote.option,
            timestamp: vote.timestamp ? new Date(vote.timestamp) : new Date()
          })

        if (error) {
          // Skip duplicate vote errors (unique constraint)
          if (!error.message.includes('duplicate')) {
            console.error(`  ❌ Error migrating vote:`, error)
            result.details.errors.push(`Vote: ${error.message}`)
          }
        } else {
          result.details.votesCreated++
        }
      } catch (error: any) {
        console.error(`  ❌ Error migrating vote:`, error)
        result.details.errors.push(`Vote: ${error.message}`)
      }
    }

    // Migration complete!
    console.log('✅ Migration completed!')
    console.log('📊 Results:', result.details)

    result.success = true
    result.message = `✅ Migration successful!\n\n` +
      `• Users created: ${result.details.usersCreated}\n` +
      `• Polls created: ${result.details.pollsCreated}\n` +
      `• Votes created: ${result.details.votesCreated}\n` +
      (result.details.errors.length > 0 ? `\n⚠️ ${result.details.errors.length} errors occurred (check console)` : '')

    return result
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    result.message = `❌ Migration failed: ${error.message}`
    result.details.errors.push(error.message)
    return result
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = migrateLocalStorageToSupabase
}

export default migrateLocalStorageToSupabase

