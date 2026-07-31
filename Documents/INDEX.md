# Nimiq Pulse — Documentation Index

All specifications for the Nimiq Pulse Mini App. Version 1.0 · 31 July 2026.

---

## Read in this order

| # | Document | Answers |
| --- | --- | --- |
| 1 | [PRD.md](PRD.md) | What we're building, for whom, and what "done" means |
| 2 | [software_architecture.md](software_architecture.md) | How the system is arranged, and why (8 ADRs) |
| 3 | [TDD.md](TDD.md) | How each part works: APIs, schema, algorithms, tests |
| 4 | [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) | The design point of view and what we refuse to do |
| 5 | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Tokens, type, components, motion |
| 6 | [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) | Screens, navigation, vocabulary |
| 7 | [USER_FLOWS.md](USER_FLOWS.md) | Every journey, with failure paths and dialog budgets |
| 8 | [FRONTEND.md](FRONTEND.md) | Client stack, bootstrap, provider boundary, budgets |

## Reference while building

| Document | Use when |
| --- | --- |
| [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Deciding where a file goes |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | Writing or reviewing code |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | Adding state or a data fetch |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Anything can fail — so, always |
| [SECURITY.md](SECURITY.md) | Touching auth, writes, or user input |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Building any UI |
| [COPY_GUIDE.md](COPY_GUIDE.md) | Writing a single word a user will read |
| [BRAND_AND_LOGO.md](BRAND_AND_LOGO.md) | Using the mark or brand assets |

---

## The five facts that shape everything

Each was verified directly — against the installed SDK, the live network, or the packaged Nimiq CSS — not assumed.

1. **The Nimiq provider has no transaction history or balance method.** It offers only `listAccounts`, `sign`, `isConsensusEstablished`, `getBlockNumber`, and `send*Transaction`. Pulse's entire mechanic is history-versus-registry matching, so a backend and a chain indexer are mandatory, not optional. → [software_architecture.md](software_architecture.md) ADR-1

2. **The SDK resolves with `ErrorResponse` instead of rejecting.** A declined approval dialog arrives as a *fulfilled* promise, so a plain `try/catch` reads a user's "no" as success. Every wallet call goes through `unwrap()`. → [ERROR_HANDLING.md](ERROR_HANDLING.md) §2

3. **No public Nimiq RPC endpoint was confirmed working.** `rpc.nimiq.com` doesn't resolve; `rpc.nimiq-testnet.com` returned HTTP 405 on POST across several paths. Pulse self-hosts a history node, with the endpoint as configuration. → [software_architecture.md](software_architecture.md) ADR-2

4. **Login costs one approval dialog, not two.** `sign()` returns the public key, and a Nimiq address derives from it — so the server can prove the address without a separate `listAccounts()` call. → [software_architecture.md](software_architecture.md) ADR-3

5. **Colours and typefaces come from Nimiq's own `nimiq-css` package.** Mulish and Fira Mono; the palette converted from the package's OKLCH definitions, cross-checked against Nimiq's published brand hexes. → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §1

---

## Rubric coverage

| Judging question | Where it's answered |
| --- | --- |
| Professional and trustworthy at first glance? | [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) §2, P1 · [COPY_GUIDE.md](COPY_GUIDE.md) §1 |
| Colours, typography, layout clean and consistent? | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Figure it out without instructions? | [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §2, §7 |
| Native and responsive on a phone? | [ACCESSIBILITY.md](ACCESSIBILITY.md) · [FRONTEND.md](FRONTEND.md) §6 |
| Zero to using it in under 60 seconds? | [USER_FLOWS.md](USER_FLOWS.md) §2 |

---

## Open decisions

Still owner calls, listed in [PRD.md](PRD.md) §16 and [TDD.md](TDD.md) §14:

- **D1** Mainnet or testnet for the demo
- **D2** Who moderates registry submissions, and how fast
- **D3** Whether the limited badge is genuinely on-chain — if not, rename it
- **D5** Production origin and domain — **needed early**, because the device identifier is origin-scoped
- **T1** The history node is on the critical path and cannot be parallelised late

One product inconsistency is flagged rather than silently resolved: the brief's four-feature MVP excludes the Developer Registry, while the entire distribution strategy depends on it. [PRD.md](PRD.md) §9.1 recommends pulling it in.
