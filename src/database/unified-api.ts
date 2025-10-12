import { PollzAPI as LocalStorageAPI } from './api'
import { SupabasePollzAPI } from './supabase-api'
import { isSupabaseConfigured } from './supabase'

/**
 * Unified API that automatically switches between localStorage and Supabase
 * 
 * - If Supabase is configured (.env has valid credentials), uses Supabase
 * - Otherwise, falls back to localStorage
 * 
 * This allows seamless migration without changing code everywhere
 */

const useSupabase = isSupabaseConfigured()

console.log(`🔄 Using ${useSupabase ? 'Supabase' : 'localStorage'} for data storage`)

export const UnifiedPollzAPI = {
  // Poll operations
  getAllPolls: useSupabase 
    ? SupabasePollzAPI.getAllPolls.bind(SupabasePollzAPI)
    : LocalStorageAPI.getAllPolls.bind(LocalStorageAPI),

  getPollsWithVoteStatus: useSupabase
    ? SupabasePollzAPI.getPollsWithVoteStatus.bind(SupabasePollzAPI)
    : LocalStorageAPI.getPollsWithVoteStatus.bind(LocalStorageAPI),

  hasUserVoted: useSupabase
    ? SupabasePollzAPI.hasUserVoted.bind(SupabasePollzAPI)
    : LocalStorageAPI.hasUserVoted.bind(LocalStorageAPI),

  getPollsBatch: useSupabase
    ? SupabasePollzAPI.getPollsBatch.bind(SupabasePollzAPI)
    : LocalStorageAPI.getPollsBatch.bind(LocalStorageAPI),

  getTotalPollsCount: useSupabase
    ? SupabasePollzAPI.getTotalPollsCount.bind(SupabasePollzAPI)
    : LocalStorageAPI.getTotalPollsCount.bind(LocalStorageAPI),

  getPollById: useSupabase
    ? SupabasePollzAPI.getPollById.bind(SupabasePollzAPI)
    : LocalStorageAPI.getPollById.bind(LocalStorageAPI),

  createPoll: useSupabase
    ? SupabasePollzAPI.createPoll.bind(SupabasePollzAPI)
    : LocalStorageAPI.createPoll.bind(LocalStorageAPI),

  voteOnPoll: useSupabase
    ? SupabasePollzAPI.voteOnPoll.bind(SupabasePollzAPI)
    : LocalStorageAPI.voteOnPoll.bind(LocalStorageAPI),

  // User operations
  getUserById: useSupabase
    ? SupabasePollzAPI.getUserById.bind(SupabasePollzAPI)
    : LocalStorageAPI.getUserById.bind(LocalStorageAPI),

  getUserByEmail: useSupabase
    ? SupabasePollzAPI.getUserByEmail.bind(SupabasePollzAPI)
    : LocalStorageAPI.getUserByEmail.bind(LocalStorageAPI),

  createUser: useSupabase
    ? SupabasePollzAPI.createUser.bind(SupabasePollzAPI)
    : LocalStorageAPI.createUser.bind(LocalStorageAPI),

  // Trending operations
  getTrendingPolls: useSupabase
    ? SupabasePollzAPI.getTrendingPolls.bind(SupabasePollzAPI)
    : LocalStorageAPI.getTrendingPolls.bind(LocalStorageAPI),

  updateTrendingPolls: useSupabase
    ? SupabasePollzAPI.updateTrendingPolls.bind(SupabasePollzAPI)
    : LocalStorageAPI.updateTrendingPolls.bind(LocalStorageAPI),

  // Analytics operations
  getPollAnalytics: useSupabase
    ? SupabasePollzAPI.getPollAnalytics.bind(SupabasePollzAPI)
    : LocalStorageAPI.getPollAnalytics.bind(LocalStorageAPI),

  // Search operations
  searchPolls: useSupabase
    ? SupabasePollzAPI.searchPolls.bind(SupabasePollzAPI)
    : LocalStorageAPI.searchPolls.bind(LocalStorageAPI),

  getPollsByCategory: useSupabase
    ? SupabasePollzAPI.getPollsByCategory.bind(SupabasePollzAPI)
    : LocalStorageAPI.getPollsByCategory.bind(LocalStorageAPI),

  getUserPolls: useSupabase
    ? SupabasePollzAPI.getUserPolls.bind(SupabasePollzAPI)
    : LocalStorageAPI.getUserPolls.bind(LocalStorageAPI),

  // Smart features (localStorage only for now)
  getCategorySuggestions: LocalStorageAPI.getCategorySuggestions.bind(LocalStorageAPI),
  checkForDuplicates: LocalStorageAPI.checkForDuplicates.bind(LocalStorageAPI),

  // Notification methods
  createNotification: useSupabase
    ? SupabasePollzAPI.createNotification.bind(SupabasePollzAPI)
    : LocalStorageAPI.createNotification.bind(LocalStorageAPI),

  getUserNotifications: useSupabase
    ? SupabasePollzAPI.getUserNotifications.bind(SupabasePollzAPI)
    : LocalStorageAPI.getUserNotifications.bind(LocalStorageAPI),

  markNotificationAsRead: useSupabase
    ? SupabasePollzAPI.markNotificationAsRead.bind(SupabasePollzAPI)
    : LocalStorageAPI.markNotificationAsRead.bind(LocalStorageAPI),

  // Poll history methods
  addPollHistory: useSupabase
    ? SupabasePollzAPI.addPollHistory.bind(SupabasePollzAPI)
    : LocalStorageAPI.addPollHistory.bind(LocalStorageAPI),

  getUserPollHistory: useSupabase
    ? SupabasePollzAPI.getUserPollHistory.bind(SupabasePollzAPI)
    : LocalStorageAPI.getUserPollHistory.bind(LocalStorageAPI),

  // Timer methods (localStorage only)
  updatePollTimer: LocalStorageAPI.updatePollTimer.bind(LocalStorageAPI),

  // Development methods (localStorage only)
  resetPollsForDevelopment: LocalStorageAPI.resetPollsForDevelopment.bind(LocalStorageAPI),
  generate50AdditionalPolls: LocalStorageAPI.generate50AdditionalPolls.bind(LocalStorageAPI),
}

// Export as default and named export
export default UnifiedPollzAPI

// Helper to check which API is being used
export const isUsingSupabase = () => useSupabase
export const getAPIType = () => useSupabase ? 'Supabase' : 'localStorage'

