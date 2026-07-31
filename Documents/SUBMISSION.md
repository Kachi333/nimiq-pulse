# Nimiq Pulse — Submission Pack

Copy-ready answers for the submission form, plus what still has to be true
before each one is honest.

---

## 1. Form fields

### App name
```
Nimiq Pulse
```

### Category
```
Discovery / Ecosystem infrastructure
```
If the form only offers consumer categories, choose **Utility** — Pulse is used
directly by wallet holders, not just by developers.

### Tagline (one punchy line)
```
Every Mini App starts at zero users. Pulse is the layer that fixes that.
```

Alternatives, if a different angle fits the form better:

- `The home screen for the Nimiq Mini App ecosystem.`
- `Your wallet's history, turned into a reason to explore.`
- `Discovery, identity and rewards for every Mini App — built on public chain data.`

The first is strongest: it names a problem judges already recognise and claims a
solution in seven words.

### Short description
```
Nimiq Pulse is an open, on-chain growth layer for every Nimiq Mini App.

It keeps a public registry of Mini App receiving addresses, reads real wallet
history against it, and turns the result into personalised discovery, a wallet
identity with XP and achievements, daily quests, and reviews that only wallets
who actually paid can write.

Users get a reason to explore the ecosystem and a profile that follows them
across it. Developers get a free acquisition channel the moment they submit an
address — no partnership, no permission, no marketing budget.

Every number Pulse shows traces back to a real on-chain payment. There is no
mock data anywhere in the build.
```

### Pricing
```
Free. No fees, no token, no paid placement.
```

Worth adding if the field allows more: *Pulse takes no cut of any payment and
never holds funds. Ranking cannot be bought — it is computed from on-chain
activity alone.*

---

## 2. Links

### Repo URL
```
https://github.com/Kachi333/nimiq-pulse
```

### Demo URL

**This needs a deployment.** The app currently runs on a LAN address that no
judge can reach. See §3.

Once deployed, the Demo URL should be the **deeplink**, not the bare URL, so a
judge on a phone lands inside Nimiq Pay with wallet access rather than in a
browser where nothing works:

```
nimiqpay://miniapp?url=https://<your-domain>
```

Give the plain `https://<your-domain>` alongside it if the form rejects custom
schemes, with a one-line note: *"Open in Nimiq Pay → Mini Apps → Custom URL."*

### Video walkthrough

60–90 seconds, wow-moment first. Script in §4.

---

## 3. Deployment — the blocker

Pulse is two processes, and they have very different hosting needs.

| Part | Needs | Works on |
| --- | --- | --- |
| `nimiq-pulse` | Static files over HTTPS | Vercel, Netlify, Cloudflare Pages — any of them, free tier |
| `pulse-api` | A **long-running Node process** with outbound WebSockets | Railway, Render, Fly.io, or any VPS |

**The backend will not run on serverless.** The embedded light client needs
~40 s to reach consensus and must hold peer connections open. A function that
cold-starts per request cannot do that. Pick a platform that runs a persistent
process.

### Frontend

```sh
cd nimiq-pulse
npm run build          # outputs dist/
```

Deploy `dist/` as a static site. Set one environment variable at build time:

```
VITE_API_BASE=https://<your-api-domain>
VITE_TIP_JAR_ADDRESS=<your address>
```

### Backend

```sh
cd pulse-api
npm install
npm start
```

Set these in the platform's environment settings:

| Variable | Value |
| --- | --- |
| `JWT_SECRET` | A fresh 48-byte random string — **not** the one in your local `.env` |
| `NIMIQ_NETWORK` | `mainalbatross` for the demo |
| `TIP_JAR_ADDRESS` | Your receiving address |
| `CORS_ORIGINS` | `https://<your-frontend-domain>` — exact, no trailing slash |
| `PORT` | Whatever the platform injects |

Persist `pulse.<network>.db` on a volume if the platform offers one. Without it,
a redeploy re-indexes from scratch — not fatal, but the feed is empty for a few
minutes and XP disappears until it catches up.

### Two things that will bite

**CORS.** The allowlist is exact. A mismatch between `CORS_ORIGINS` and the real
frontend origin means the app loads fine and every API call fails silently.
Check it first if the deployed app looks empty.

**The origin is permanent-ish.** Nimiq Pay's device identifier is scoped to your
origin, so changing domains later resets every device-based abuse limit. Choose
the final domain before you share the link.

---

## 4. Video script (60–90 s)

Wow-moment first. Do not open with a title card.

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:10 | Tap Connect, approve, profile populates | "This is a wallet that has never opened Pulse before. One tap." |
| 0:10–0:20 | Achievements and activity, already filled | "Everything here was computed from its real payment history on the Nimiq chain. Nothing is seeded." |
| 0:20–0:35 | Discover, point at the reason chips | "Apps ranked by what wallets like yours actually paid for. Every recommendation states why." |
| 0:35–0:50 | Quests → send tip → approve → XP animates | "One quest every day needs a real NIM payment, so the chain is load-bearing, not decoration." |
| 0:50–1:05 | Review gate, then a verified review | "You can only review an app you have actually paid. Fake reviews are impossible by construction." |
| 1:05–1:20 | Submit your Mini App form | "And any builder can list their app in under a minute. Every app added makes Pulse smarter for everyone." |
| 1:20–1:30 | Profile again | "Every Mini App starts at zero users. We built the layer that fixes that — for every app, not just ours." |

**Record on a real phone inside Nimiq Pay.** A desktop browser cannot show the
approval dialogs, and those dialogs are the proof it is really a Mini App.

Use a wallet **with** history for the opening shot — an empty profile is honest
but undersells it. Show the empty state later if there is room.

---

## 5. Before you submit

- [ ] Remove the demo registry entry — it is a real address but **not** a Mini App
      ```sql
      DELETE FROM apps WHERE category = 'demo';
      ```
- [ ] Seed 5–10 real Mini App addresses (`npm run registry:add`)
- [ ] Set `TIP_JAR_ADDRESS`, or the tip quest stays hidden and the NIM-usage
      claim is unsupported
- [ ] Fresh `JWT_SECRET` in production
- [ ] Deploy both parts; confirm the deployed API answers `/health`
- [ ] Open the deeplink on a phone that has never seen Pulse and time it —
      the under-60-seconds claim should survive a stopwatch
- [ ] Run the pre-ship checklist:
      `nimiq-pulse/.agents/skills/mini-apps/references/checklist.md`

---

## 6. Claims to keep honest

Judges check these, and an overclaim costs more than the feature is worth.

| Claim | Status |
| --- | --- |
| "Real on-chain data, no mock data" | **True.** Verified: the indexer pulled 599 real mainnet and 100 testnet interactions |
| "One approval dialog to sign in" | **True.** Address is derived from the signing public key |
| "Reviews require proof of payment" | **True**, re-checked server-side on write |
| "Works offline from cache" | **True**, degrades to a stale banner |
| "Registry submission in under a minute" | **True**, but visibility follows moderation — say both |
| "Limited on-chain badge" | **Not built.** If you mention it, describe it as an off-chain badge anchored to a qualifying payment |
| "N Mini Apps listed" | Only true once you seed real addresses |
