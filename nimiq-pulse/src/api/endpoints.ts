import { request } from './client'
import type {
  AppDetail,
  AuthResult,
  Challenge,
  ClaimResult,
  Feed,
  Profile,
  QuestsToday,
  Review,
  ReviewsOverview,
} from './types'

export const api = {
  challenge: () => request<Challenge>('/auth/challenge', { method: 'POST', auth: false }),

  verify: (nonce: string, publicKey: string, signature: string) =>
    request<AuthResult>('/auth/verify', {
      method: 'POST',
      auth: false,
      body: { nonce, publicKey, signature },
    }),

  profile: () => request<Profile>('/profile'),

  discover: () => request<Feed>('/discover'),

  app: (id: string) => request<AppDetail>(`/apps/${id}`),

  submitApp: (body: {
    name: string
    address: string
    url: string
    description: string
    category: string
  }) => request<{ appId: string; status: string }>('/apps', { method: 'POST', body }),

  questsToday: () => request<QuestsToday>('/quests/today'),

  claimQuest: (id: string, txHash?: string) =>
    request<ClaimResult>(`/quests/${id}/claim`, { method: 'POST', body: { txHash } }),

  reviewsForApp: (appId: string) => request<{ reviews: Review[] }>(`/reviews?appId=${appId}`),

  reviewsOverview: () => request<ReviewsOverview>('/reviews'),

  publishReview: (appId: string, rating: number, body?: string) =>
    request<{ ok: true; unlockedAchievements: string[] }>('/reviews', {
      method: 'POST',
      body: { appId, rating, body },
    }),
}
