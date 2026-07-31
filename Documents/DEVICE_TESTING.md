# Testing Nimiq Pulse on a Physical Phone

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Why it matters | A desktop browser **cannot** exercise the wallet provider at all |
| Related | [ERROR_HANDLING.md](ERROR_HANDLING.md) · [USER_FLOWS.md](USER_FLOWS.md) |

---

## 1. Why this cannot be skipped

The Nimiq provider is injected by Nimiq Pay into its own WebView. It does not exist in Chrome, Safari, or any desktop browser. Open Pulse on a laptop and you get the "Open this in Nimiq Pay" screen — correct behaviour, and also the *only* behaviour available there.

So everything that makes Pulse a Mini App is untested until it runs on a phone:

- the login approval dialog, and that it appears exactly **once**
- that a declined dialog leaves the app usable rather than broken
- the tip payment actually broadcasting
- safe-area insets, tap targets, and whether it feels native
- whether the whole first run really fits in 60 seconds

Every one of those is a scored rubric item.

---

## 2. What you need

| | |
| --- | --- |
| Phone | Nimiq Pay installed (iOS or Android) |
| Network | Phone and computer on **the same Wi-Fi** |
| Backend | `pulse-api` running, reachable on the LAN |
| Frontend | `nimiq-pulse` dev server running with `host: true` |

The single most common failure is the phone and laptop being on different networks — a guest SSID, a VPN, or 5 GHz vs 2.4 GHz bands that are isolated from each other.

---

## 3. Start both processes

```sh
# terminal 1
cd pulse-api
npm start
```

Wait for:

```
[api] listening on :8787 (network mainalbatross)
[chain] consensus established in 39.7s
[indexer] started, one address every 20s
```

The API answers immediately; the chain line arrives ~40 s later. Payment quests need consensus, so let it land before testing tips.

```sh
# terminal 2
cd nimiq-pulse
npm run dev
```

Note the **Network** line exactly as printed:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.46:5173/   ← this one
```

**Use the Network URL, never `localhost`.** Inside the phone's WebView, `localhost` is the *phone*, not your computer.

### If the port is not 5173

Vite silently moves to 5174 if 5173 is taken. If that happens, CORS will block every API call, because the allowlist is exact. Either free the port:

```sh
# Windows
Get-NetTCPConnection -LocalPort 5173 -State Listen | Select OwningProcess
Stop-Process -Id <pid> -Force
```

or add the new origin to `CORS_ORIGINS` in `pulse-api/.env` and restart the API.

---

## 4. Confirm the LAN path before touching the phone

Two commands save a lot of guesswork:

```sh
curl http://192.168.1.46:5173/          # should be 200
curl http://192.168.1.46:8787/health    # should be JSON with "ok":true
```

Use your own IP. If the first works but the second does not, the API is bound to localhost only or a firewall is blocking 8787.

On Windows, the first LAN connection usually raises a firewall prompt — allow Node on **private** networks. If you dismissed it, re-add it:

```powershell
New-NetFirewallRule -DisplayName "Pulse dev" -Direction Inbound `
  -LocalPort 5173,8787 -Protocol TCP -Action Allow -Profile Private
```

---

## 5. Load it in Nimiq Pay

1. Open **Nimiq Pay** on the phone.
2. Tap the **Mini Apps** library (bottom-right).
3. Choose **Custom URL** / enter a URL.
4. Type the Network URL: `http://192.168.1.46:5173`
5. Nimiq Pay warns before opening a URL it has not seen. That warning is expected for a dev URL — accept it.

Typing an IP on a phone keyboard is miserable. Faster: message yourself the deeplink and tap it.

```
nimiqpay://miniapp?url=http://192.168.1.46:5173
```

---

## 6. Switch to testnet first

Payment quests move **real NIM** on mainnet. Test on testnet first, where NIM is free.

1. In Nimiq Pay, **long-press the settings button for 10 seconds**. A hidden dev menu appears.
2. Choose **Testnet**.
3. On the home empty state or in the Top Up modal, tap **Get free NIM** — 110 000 NIM per request.

Then point the backend at the same network:

```sh
# pulse-api/.env
NIMIQ_NETWORK=testalbatross
```

Restart the API. It re-syncs (~40 s) against testnet seed nodes.

**The testnet switch only affects Nimiq provider operations.** It does not change anything about the backend automatically — if the phone is on testnet and the API is on mainnet, logins still work (signatures are network-independent) but no payment will ever be found by the indexer, and tip quests will sit at "Confirming…" forever. Keep both on the same network.

---

## 7. The test script

Work through these in order. Each maps to a specification the app is supposed to satisfy.

### 7.1 First run — the 60-second claim

| # | Do | Expect |
| --- | --- | --- |
| 1 | Open Pulse | Logo, one sentence, one button. **No spinner.** Disclosure text sits above the button |
| 2 | Tap **Connect wallet** | **Exactly one** approval dialog |
| 3 | Approve | Profile appears with your real level, XP and achievements |
| 4 | — | Start a stopwatch at step 1. From open to first achievement should be under 60 s |

If you see **two** dialogs, that is a bug: login is designed to need only `sign()`, deriving the address from the returned public key.

### 7.2 Declining — the most-missed path

| # | Do | Expect |
| --- | --- | --- |
| 1 | Reload, tap **Connect wallet**, then **decline** | Calm grey message: "No problem — connect whenever you're ready." **Not red, not an error** |
| 2 | — | The button still works; nothing re-prompts automatically |

This is the single most valuable test in the list. The SDK *resolves* with an error object rather than rejecting, so a naive implementation reads a decline as success and would mark the quest complete.

### 7.3 Zero-history wallet

Use a brand-new wallet with no transactions.

| Expect | |
| --- | --- |
| Profile | Level 1, 0 XP, all achievements locked **with their conditions visible** |
| Discover | "Starter Mini Apps to try" — never an empty list |
| Quests | A `STARTER` quest that can actually be completed |

No screen may show "Nothing here yet".

### 7.4 Tip payment

Requires `TIP_JAR_ADDRESS` set and consensus established.

| # | Do | Expect |
| --- | --- | --- |
| 1 | Quests → **Send tip** | Sheet with preset amounts, exact NIM shown, no hidden fee |
| 2 | Confirm | One approval dialog |
| 3 | Approve | Sheet closes, row shows "Confirming…", **the app stays usable** |
| 4 | Wait ~2 min | Row flips to completed, XP bar animates |
| 5 | Repeat, but **decline** | "Payment cancelled — the quest is still open", row returns to available |

Step 4 takes about two minutes because the indexer waits 120 confirmations. That is deliberate. If it never completes, check that phone and API are on the same network.

### 7.5 Offline behaviour

| # | Do | Expect |
| --- | --- | --- |
| 1 | Load Pulse fully, then turn on airplane mode | Cached content still renders |
| 2 | — | A grey banner: "Couldn't refresh — showing your last synced data" |
| 3 | — | **No blank screen, no spinner, no crash** |

### 7.6 Review gate

| # | Do | Expect |
| --- | --- | --- |
| 1 | Open an app you have not paid → try to review | Blocked with "Pay this app first to leave a verified review" **plus a button to open the app** |
| 2 | Pay it, wait for indexing, retry | Composer opens; publishing adds a "Verified payer" badge |

### 7.7 Feel and fit

Hold the phone one-handed and check:

- [ ] Nothing hidden behind the notch or the home indicator
- [ ] Every button reachable with a thumb
- [ ] No horizontal scrolling anywhere
- [ ] Tapping a text field does **not** zoom the page
- [ ] Text readable without squinting at normal brightness
- [ ] Tab labels visible — not icons alone

Then two quick system-level checks:

- **Reduced motion** on (Settings → Accessibility): achievements still appear, just without movement
- **Largest text size**: nothing clips or overlaps

And the fastest single test of all: **screenshot a few screens and view them in greyscale.** If any state becomes ambiguous, colour is carrying meaning alone, which fails both accessibility and a judge glancing at a screenshot.

---

## 8. Debugging on the phone

You cannot open devtools in the WebView directly, but you have options.

**Remote inspection**
- **Android**: `chrome://inspect` on the desktop with USB debugging on. The WebView appears there.
- **iOS**: Safari → Develop → your iPhone. Requires Web Inspector enabled in Settings → Safari → Advanced.

**Server-side is often enough.** The API logs every sweep and error:

```sh
curl http://192.168.1.46:8787/health
```

`chain.ready` false means consensus has not landed. `indexer.lastError` shows the most recent sweep failure.

**Secure-context APIs.** LAN dev is plain HTTP, so `crypto.randomUUID()` and friends may be missing **on the phone even though they work on desktop localhost**. Pulse already routes ID generation through a fallback; if you add a new secure-context API, feature-detect it.

---

## 9. Symptom table

| Symptom | Cause | Fix |
| --- | --- | --- |
| `EADDRINUSE ... 0.0.0.0:8787` on `npm start` | An API instance is already running — often one left behind by an earlier run or an editor/agent task | See §9.1 below; free the port, then start again |
| "Open this in Nimiq Pay" on the phone | Opened in the phone's browser, not Pay | Load via Mini Apps → Custom URL |
| Blank page, never loads | Different networks, or firewall | Check `curl` from another device; allow Node on private networks |
| Loads, but every API call fails | CORS origin mismatch — usually a 5174 port shift | Match `CORS_ORIGINS` to the printed Network URL exactly |
| Login works, profile empty | Normal for a new wallet | Expected — starter set and `STARTER` quest should show |
| Tip stuck on "Confirming…" | Phone and API on different networks, or under 120 confirmations | Align networks; wait ~2 min |
| No tip quest at all | `TIP_JAR_ADDRESS` unset | Set it in `pulse-api/.env`; the API withholds the quest deliberately |
| Two approval dialogs at login | Regression | Login must use `sign()` only, never `listAccounts()` |
| Page zooms when typing | An input below 16px | All inputs are 16px; check any new one |

---

### 9.1 Freeing a port

```powershell
# Windows — who holds it
Get-NetTCPConnection -LocalPort 8787 -State Listen | Select OwningProcess
Stop-Process -Id <pid> -Force
```

```sh
# macOS / Linux
lsof -ti :8787 | xargs kill -9
```

**After freeing 5173, check which port Vite actually prints.** It shifts to 5174
when 5173 is busy, and the CORS allowlist is exact — so the app loads on the
phone but every API call fails silently. Either free 5173 properly or update
`CORS_ORIGINS` in `pulse-api/.env` to match, then restart the API.

Only one API instance can run at a time. Both processes must stay running for
the whole session: the mini app serves the UI, the API serves the data.

---

## 10. Before you call it done

Run the skill's own checklist end to end:

```
nimiq-pulse/.agents/skills/mini-apps/references/checklist.md
```

Report PASS / FAIL / SKIP per item. The sections this app is most exposed on are **2 (mobile-first)**, **4 (error handling)**, **5 (approval-dialog UX)**, and **8 (LAN testing and secure-context fallbacks)**.
