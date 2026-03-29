export interface Poll {
  id: string
  title: string
  optionA: string
  optionB: string
  votes: number
  votesOptionA: number
  votesOptionB: number
  category: string
  timeLeft: string
  author: string
  authorId: string
  authorUsername?: string
  isVoted: boolean
  votedOption?: 'A' | 'B'
  createdAt: Date
  expiresAt: Date
  timerEnabled: boolean
  isExpired: boolean
  trendingScore?: number
  isDeathmatch: boolean
  optionAOwnerId?: string
  optionBOwnerId?: string
  deathmatchStatus?: 'pending' | 'accepted' | 'rejected'
  validationStatus?: 'pending' | 'approved' | 'rejected'
  isConfession?: boolean
  moderationResult?: {
    verdict: 'safe' | 'flagged'
    reason: string
    confidence: number
    model: string
    timestamp: string
  }
}

export interface User {
  id: string
  name: string
  username: string
  email?: string
  avatar: string
  password?: string
  role?: 'user' | 'admin'
  followers: number
  following: number
  reputation: number
  pollCount: number
  winRate: number
  joinDate: Date
  status?: 'active' | 'suspended' | 'banned'
  statusReason?: string
  bio?: string
}

export interface Vote {
  id: string
  pollId: string
  userId: string
  option: 'A' | 'B'
  timestamp: Date
}

export interface PollNotification {
  id: string
  pollId: string
  userId: string
  type: 'poll_expired' | 'poll_created' | 'poll_trending' | 'deathmatch_created' | 'deathmatch_accepted' | 'deathmatch_rejected'
  message: string
  isRead: boolean
  createdAt: Date
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface FriendUser extends User {
  isFollowingBack: boolean
}

export interface CreatePollFormData {
  title: string
  optionA: string
  optionB: string
  category: string
  timerEnabled: boolean
  timerDuration?: number
  isDeathmatch: boolean
  optionAUserId?: string
  optionBUserId?: string
  isConfession?: boolean
}

export interface AdminStats {
  totalUsers: number
  totalPolls: number
  totalVotes: number
  activeUsers: number
  pendingPolls: number
}

export interface AdminAuditLog {
  id: string
  adminId: string
  adminUsername: string
  actionType: 'user_role_changed' | 'user_suspended' | 'user_banned' | 'user_unsuspended' | 'poll_deleted' | 'poll_approved' | 'poll_rejected'
  targetId: string
  targetType: 'user' | 'poll'
  reason?: string
  previousValue?: string
  newValue?: string
  createdAt: Date
}
