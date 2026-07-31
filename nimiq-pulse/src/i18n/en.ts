/** Every user-facing string. See COPY_GUIDE.md. */
export const t = {
  app: { name: 'Nimiq Pulse', short: 'Pulse' },

  connect: {
    title: 'Your wallet, across every Mini App',
    body: 'Pulse finds Mini Apps worth trying, based on what wallets like yours actually pay for.',
    disclosure:
      'Pulse reads your public payment history to find Mini Apps you’ll like. It only stores payments to listed apps.',
    cta: 'Connect wallet',
    connecting: 'Waiting for approval…',
    declined: 'No problem — connect whenever you’re ready.',
  },

  notInPay: {
    title: 'Open this in Nimiq Pay',
    body: 'Pulse works with your wallet, so it needs to be opened from inside Nimiq Pay.',
    steps: ['Open Nimiq Pay on your phone.', 'Go to Mini Apps.', 'Enter this app’s URL.'],
    retry: 'Try again',
  },

  tabs: { profile: 'Profile', discover: 'Discover', quests: 'Quests', reviews: 'Reviews' },

  profile: {
    title: 'Profile',
    level: (n: number) => `Level ${n}`,
    xpProgress: (a: string, b: string) => `${a} / ${b} XP`,
    streak: (n: number) => `${n}-day streak`,
    noStreak: 'No streak yet',
    achievements: 'Achievements',
    activity: 'Activity',
    activityEmpty: 'Payments to listed apps will appear here.',
    locked: 'Locked',
    viewTransaction: 'View transaction',
  },

  discover: {
    title: 'Discover',
    starterLabel: 'Starter Mini Apps to try',
    forYou: 'Picked for you',
    reason: {
      POPULAR_WITH_SIMILAR: 'Popular with wallets like yours',
      TRENDING: 'Trending this week',
      NEW_THIS_WEEK: 'New this week',
      STARTER: 'A good place to start',
    },
    payers: (n: number) => `Paid by ${n} wallet${n === 1 ? '' : 's'}`,
    noReviews: 'No reviews yet',
    reviewCount: (n: number) => `${n} review${n === 1 ? '' : 's'}`,
    open: 'Open app',
    submitCta: 'Submit your Mini App',
    submitBlurb: 'List your app so other wallets can find it.',
  },

  submit: {
    title: 'Submit your Mini App',
    name: 'App name',
    address: 'Receiving Nimiq address',
    url: 'Mini App URL',
    description: 'One line about it',
    category: 'Category',
    submit: 'Submit app',
    submitting: 'Submitting…',
    badAddress: 'That doesn’t look like a Nimiq address.',
    confirmation:
      'Submitted. We review new apps before they appear in Discover, usually within a few hours. You’ll earn the Community Builder achievement once someone pays your app.',
    back: 'Back to Discover',
  },

  quests: {
    title: 'Today’s quests',
    reward: (n: number) => `+${n} XP`,
    confirming: 'Confirming…',
    completed: 'Completed',
    sendTip: 'Send tip',
    open: 'Open',
    cancelled: 'Payment cancelled — the quest is still open.',
    unconfirmed: 'We couldn’t confirm that payment yet. It may still land.',
    noConsensus: 'Nimiq Pay is still syncing.',
  },

  tip: {
    title: 'Send a tip',
    body: 'Tips keep Pulse running. This is a real NIM payment from your wallet.',
    amount: 'Amount',
    send: 'Send tip',
    sending: 'Waiting for approval…',
    cancel: 'Cancel',
  },

  reviews: {
    title: 'Reviews',
    canReview: 'Apps you can review',
    mine: 'Your reviews',
    gate: 'Pay this app first to leave a verified review.',
    verified: 'Verified payer',
    write: 'Write review',
    edit: 'Edit review',
    publish: 'Publish review',
    publishing: 'Publishing…',
    placeholder: 'What should other people know?',
    remaining: (n: number) => `${n} characters left`,
    emptyCanReview: 'Pay a Mini App to unlock reviews.',
    emptyMine: 'Reviews you write will appear here.',
    goDiscover: 'Find an app',
  },

  banner: {
    stale: 'Couldn’t refresh — showing your last synced data.',
    indexing: 'Chain data is catching up.',
  },

  session: { expired: 'Reconnect to keep earning.', reconnect: 'Reconnect' },

  common: { retry: 'Try again', back: 'Back', dismiss: 'Dismiss', loading: 'Loading' },
} as const
