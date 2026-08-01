export interface Challenge {
  nonce: string
  message: string
  expiresAt: number
}

export interface AuthResult {
  sessionToken: string
  address: string
  isNewWallet: boolean
}

export interface Achievement {
  code: string
  name: string
  condition: string
  earned: boolean
  earnedAt: number | null
  sourceTxHash: string | null
}

export interface ActivityItem {
  txHash: string
  appId: string
  appName: string
  valueLuna: number
  blockHeight: number
  timestamp: number
}

export interface Profile {
  address: string
  level: number
  xpTotal: number
  xpIntoLevel: number
  xpForNextLevel: number
  streakDays: number
  achievements: Achievement[]
  activity: ActivityItem[]
  /** 30 daily interaction counts — drives the Pulse Ring waveform. */
  waveform: number[]
}

export type FeedReason = 'POPULAR_WITH_SIMILAR' | 'TRENDING' | 'NEW_THIS_WEEK' | 'STARTER'

export interface FeedItem {
  appId: string
  name: string
  description: string
  category: string
  url: string
  deeplink: string
  distinctPayers: number
  avgRating: number | null
  reviewCount: number
  reason: FeedReason
}

export interface Feed {
  items: FeedItem[]
  isStarterSet: boolean
  generatedAt: number
}

export interface AppDetail extends Omit<FeedItem, 'reason'> {
  address: string
  canReview: boolean
  proofTxHash: string | null
}

export type QuestType = 'TIP_JAR' | 'TRY_NEW_APP' | 'FEATURED_APP' | 'WRITE_REVIEW' | 'STARTER'
export type QuestState = 'available' | 'confirming' | 'completed'

export interface Quest {
  id: string
  type: QuestType
  title: string
  description: string
  xpReward: number
  targetAppId: string | null
  state: QuestState
  /** TIP_JAR only. Served by the API so the address has one source of truth. */
  payTo?: string
  payMinLuna?: number
}

export interface QuestsToday {
  date: string
  quests: Quest[]
  unlockedAchievements: string[]
}

export interface ClaimResult {
  state: 'COMPLETED' | 'CONFIRMING'
  reason?: string
  retryAfterMs?: number
  unlockedAchievements?: string[]
}

export interface Review {
  id: string
  address: string
  rating: number
  body: string | null
  updatedAt: number
  verified: boolean
}

export interface ReviewsOverview {
  canReview: { appId: string; name: string }[]
  mine: { id: string; appId: string; name: string; rating: number; body: string | null; updated_at: number }[]
}
