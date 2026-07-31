# Nimiq Pulse

The open, on-chain growth layer for every Nimiq Mini App — discovery, identity,
reputation and rewards, computed from real wallet history against an open
registry of Mini App receiving addresses.

Specifications live in [Documents/](Documents/), indexed at
[Documents/INDEX.md](Documents/INDEX.md).

```
NIMICH PULSE 2/
├── Documents/     # PRD, TDD, architecture, design system, 14 specs
├── nimiq-pulse/   # the Mini App  (Vue 3 · TypeScript · Vite)
└── pulse-api/     # backend       (Fastify · node:sqlite · @nimiq/core)
```

## Running it

Two processes. Start the API first — it needs ~40 s to reach chain consensus,
though it serves from the database immediately.

```sh
# terminal 1 — backend
cd pulse-api
npm install
npm run seed -- --demo     # optional: pipeline-test registry entry
npm start                  # http://0.0.0.0:8787

# terminal 2 — mini app
cd nimiq-pulse
npm install
npm run dev                # http://<your-lan-ip>:5173
```

Open the **Network** URL inside Nimiq Pay → Mini Apps → Custom URL. Not
`localhost`: inside the phone's WebView that resolves to the phone.

## Configuration

`pulse-api` reads environment variables (defaults in `src/config.ts`):

| Variable | Default | Notes |
| --- | --- | --- |
| `NIMIQ_NETWORK` | `testalbatross` | Database is network-scoped (`pulse.<network>.db`), so switching never mixes testnet and mainnet payments. Each network needs its own `npm run seed` |
| `TIP_JAR_ADDRESS` | *unset* | Tip quests are **withheld** until set, rather than sending real NIM to an address nobody owns. Nimiq Pay → Receive → copy |
| `MIN_REVIEW_LUNA` | `100000` (1 NIM) | Minimum payment that unlocks a review |
| `CONFIRMATIONS` | `120` | ~2 minutes; two Albatross batches |
| `CORS_ORIGINS` | localhost + LAN :5173 | Explicit allowlist, never `*` |
| `JWT_SECRET` | dev placeholder | **Replace before deploying** |

`nimiq-pulse/.env` holds client config only — `VITE_API_BASE` and
`VITE_TIP_JAR_ADDRESS`. Never put a secret in a `VITE_` variable; Vite inlines
them into the bundle.

## How it works

The Nimiq provider exposes no transaction history, so the backend embeds a
`@nimiq/core` light client and indexes payments to registry addresses into
SQLite. The Mini App is a thin client: every reward, rank and eligibility check
is computed server-side and re-derived from chain data, so a modified client
gains nothing.

Login costs **one** approval dialog: the wallet signs a server nonce and the
backend derives the address from the returned public key, so `listAccounts()`
is never needed.

## Registry

`pulse-api/registry.seed.json` starts empty by design. Fill it with **real**
receiving addresses from **real** Mini Apps — collecting them from other
builders is the distribution mechanic, not a chore.

```sh
npm run registry:add -- --name "Tipster" --address "NQ.. .. .." \
  --url https://tipster.example --description "Tip creators in NIM" --category social

npm run registry:list     # entries with payer and interaction counts
```

`registry:add` validates the address, rejects duplicates, and mirrors the entry
into `registry.seed.json` so a database reset does not lose it. Pass `--pending`
to queue for moderation instead of listing immediately.

`npm run seed -- --demo` inserts a clearly-labelled real address to prove the
indexing pipeline. It is **not** a Mini App — remove it before showing the
registry to anyone:

```sql
DELETE FROM apps WHERE category = 'demo';
```

## Testing on a phone

See [Documents/DEVICE_TESTING.md](Documents/DEVICE_TESTING.md). A desktop
browser cannot exercise the wallet provider at all, so device testing is the
only way to verify the approval dialogs, the payment flow, and how it feels.

## Status

Built and verified: backend, indexer, auth, all four features, the client
shell and every screen. Not yet done: testing inside Nimiq Pay on a physical
phone, and the pre-ship checklist in
`nimiq-pulse/.agents/skills/mini-apps/references/checklist.md`.
