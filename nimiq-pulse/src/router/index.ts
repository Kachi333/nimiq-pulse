import { createRouter, createWebHistory } from 'vue-router'
import { readRaw } from '../cache/store'
import ConnectView from '../features/connect/ConnectView.vue'
import ProfileView from '../features/profile/ProfileView.vue'

/** Profile is in the initial chunk — it is the landing tab. The rest split. */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/profile' },
    { path: '/connect', component: ConnectView, meta: { public: true, bare: true } },
    { path: '/profile', component: ProfileView },
    {
      path: '/profile/achievement/:code',
      component: () => import('../features/profile/ProfileView.vue'),
    },
    { path: '/discover', component: () => import('../features/discover/DiscoverView.vue') },
    {
      path: '/discover/app/:id',
      component: () => import('../features/discover/AppDetailView.vue'),
    },
    {
      path: '/discover/submit',
      component: () => import('../features/discover/SubmitAppView.vue'),
    },
    { path: '/quests', component: () => import('../features/quests/QuestsView.vue') },
    { path: '/reviews', component: () => import('../features/reviews/ReviewsView.vue') },
    {
      path: '/reviews/compose/:appId',
      component: () => import('../features/reviews/ReviewComposerView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/profile' },
  ],
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

/** Session is read synchronously, so there is no auth flicker on boot. */
router.beforeEach((to) => {
  const signedIn = !!readRaw<{ token: string }>('session')?.token
  if (!to.meta.public && !signedIn) return '/connect'
  if (to.path === '/connect' && signedIn) return '/profile'
  return true
})
