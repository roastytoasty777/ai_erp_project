# AI ERP — Development Roadmap Tickets

Structured tickets for the AI-powered ERP system (FastAPI backend + React → Next.js frontend).

> **Note on numbering:** `TICKET-###` identifiers are stable and used for cross-references in the
> "Depends on" fields. They are independent of any GitHub Issue numbers that may be assigned later.

**Legend**
- **Priority:** Critical / High / Medium / Low
- **Effort:** S (hours) / M (1–2 days) / L (3–5 days) / XL (1+ week)

---

## Phase 1 — Refactor (Backend)

### [TICKET-001] Add created_at timestamp column to orders table
- **Phase:** 1
- **Priority:** Critical
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Add a `created_at` timestamp (UTC, server-default `now()`) to the `orders` table. This is foundational data required by every future ML/forecasting feature (days-of-stock, Prophet, anomaly detection, sales velocity). Backfill existing rows with a best-effort value or a flagged sentinel.

**Acceptance criteria:**
- [ ] `orders.created_at` column exists, non-null, defaults to server time on insert
- [ ] New orders persist an accurate UTC timestamp without app-side intervention
- [ ] Existing rows are backfilled (documented strategy for unknown dates)
- [ ] Column is exposed in the order read schema/response

### [TICKET-002] Extract shared order aggregation logic into _aggregate_orders() helper
- **Phase:** 1
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** Order aggregation logic is duplicated across 3 endpoints, causing drift and inconsistent results. Extract into a single `_aggregate_orders()` helper that all three call. Single source of truth, easier to test, prerequisite for clean AI insights input.

**Acceptance criteria:**
- [ ] `_aggregate_orders()` helper exists and is the only place aggregation logic lives
- [ ] All 3 endpoints call the helper; no duplicated aggregation code remains
- [ ] Endpoint responses are equivalent to pre-refactor output (regression-checked)
- [ ] Helper has unit tests covering empty, single, and multi-order cases

### [TICKET-003] Make stock deduction + order insert atomic in create_order
- **Phase:** 1
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** `create_order` currently performs stock deduction and order insert as separate operations, so a failure mid-way leaves stock and orders inconsistent. Wrap both in a single DB transaction that commits or rolls back together. Data integrity is non-negotiable for an ERP ledger.

**Acceptance criteria:**
- [ ] Stock deduction and order insert occur in one transaction
- [ ] A simulated failure after deduction rolls back the stock change (no partial state)
- [ ] Insufficient-stock condition aborts before any write and returns a clear 4xx error
- [ ] Test reproduces the original bug and confirms it is fixed

### [TICKET-004] Fix update_item data loss bug (multi-row overwrite/delete)
- **Phase:** 1
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** `update_item` updates the first matching row and silently deletes all other rows for the same item, destroying data. Correct the query to target the intended row(s) by primary key and never delete siblings as a side effect. Silent data loss is a severe correctness defect.

**Acceptance criteria:**
- [ ] Updating an item modifies only the intended row, identified by primary key
- [ ] No rows are deleted as a side effect of an update
- [ ] Regression test reproduces the original data loss and confirms the fix
- [ ] Behavior verified for items that legitimately have multiple rows

### [TICKET-005] Remove implicit record creation from update_stock (return 404)
- **Phase:** 1
- **Priority:** High
- **Effort:** S (hours)
- **Depends on:** none

**Description:** `update_stock` currently creates a record when the item doesn't exist (implicit upsert), masking client errors. Change it to return 404 when the item is absent. Update semantics should not silently create; callers must handle missing items explicitly.

**Acceptance criteria:**
- [ ] Updating a non-existent item returns HTTP 404 with a clear message
- [ ] No new record is created on update of a missing item
- [ ] Updating an existing item continues to work unchanged
- [ ] Test covers both the 404 path and the successful-update path

### [TICKET-006] Fix CORS misconfiguration (wildcard origins + credentials)
- **Phase:** 1
- **Priority:** High
- **Effort:** S (hours)
- **Depends on:** none

**Description:** `allow_origins=["*"]` with `allow_credentials=True` is rejected by browsers per the CORS spec. Replace the wildcard with an explicit allowlist sourced from config (see TICKET-019 settings). Credentialed requests currently fail in the browser.

**Acceptance criteria:**
- [ ] `allow_origins` is an explicit list of permitted origins (no `"*"` with credentials)
- [ ] Credentialed cross-origin requests from approved origins succeed in a browser
- [ ] Allowed origins are configurable, not hardcoded
- [ ] Requests from disallowed origins are correctly blocked

### [TICKET-007] Replace deprecated @app.on_event("startup") with lifespan context manager
- **Phase:** 1
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Migrate deprecated `@app.on_event("startup")`/`shutdown` handlers to the FastAPI `lifespan` async context manager. Removes deprecation and gives clean startup/shutdown ordering for DB pools and resources.

**Acceptance criteria:**
- [ ] App uses a `lifespan` context manager; no `@app.on_event` handlers remain
- [ ] All prior startup work (and shutdown cleanup) runs in the new lifespan
- [ ] No deprecation warnings emitted on boot
- [ ] App starts and shuts down cleanly

### [TICKET-008] Add structured logging with loguru
- **Phase:** 1
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-007

**Description:** Add structured logging via loguru so every request, every error, and every DB write produces a log line with context (path, status, latency, user/correlation id where available). Current observability is insufficient for debugging and audit.

**Acceptance criteria:**
- [ ] loguru configured centrally (format, level, sinks) and initialized in lifespan
- [ ] Middleware logs each request with method, path, status, and latency
- [ ] All unhandled errors log a structured entry with stack/context
- [ ] Every DB write (create/update/delete) emits a log line
- [ ] Log level configurable via environment

### [TICKET-009] Make receipt font path configurable with load_default() fallback
- **Phase:** 1
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Receipt generation hardcodes `consola.ttf`, which only exists on Windows, breaking receipts on Linux/containers. Make the font path configurable via env var and fall back to PIL `load_default()` when the font is missing. Deployments are containerized/Linux.

**Acceptance criteria:**
- [ ] Font path read from an environment variable
- [ ] Missing/invalid font falls back to `load_default()` without crashing
- [ ] Receipt generation succeeds on Linux with no Windows font present
- [ ] Behavior documented for setting a custom font

---

## Phase 1 — Refactor (Frontend)

### [TICKET-010] Create .env with VITE_API_URL and remove hardcoded IPs
- **Phase:** 1
- **Priority:** High
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Introduce a `.env` with `VITE_API_URL` and remove the 4 hardcoded IP addresses scattered across components. Hardcoded IPs break across environments and block deployment.

**Acceptance criteria:**
- [ ] `.env` (and `.env.example`) define `VITE_API_URL`
- [ ] All 4 hardcoded IPs removed; components read the base URL from env
- [ ] App runs against different backends by changing only env
- [ ] No remaining literal IP/host strings in component code

### [TICKET-011] Create src/lib/api.js single fetch wrapper
- **Phase:** 1
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-010

**Description:** Build `src/lib/api.js`, a single fetch wrapper applying the base URL, default headers, JSON handling, and normalized error objects. Removes scattered fetch logic and standardizes error handling.

**Acceptance criteria:**
- [ ] `api.js` exposes helpers (get/post/put/delete) using `VITE_API_URL`
- [ ] Non-2xx responses produce a normalized error shape consumers can rely on
- [ ] Default headers (e.g. `Content-Type: application/json`) applied centrally
- [ ] All existing direct `fetch` calls migrated to the wrapper

### [TICKET-012] Parallelize the 3 initial data fetches with Promise.all
- **Phase:** 1
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** TICKET-011

**Description:** The 3 initial data fetches run sequentially, slowing first paint. Run them concurrently with `Promise.all`. Faster initial load with no behavior change.

**Acceptance criteria:**
- [ ] The 3 initial fetches execute concurrently via `Promise.all`
- [ ] Loading state resolves only after all three complete; partial failures handled gracefully
- [ ] Measurable reduction in combined initial load time
- [ ] No regression in rendered data

### [TICKET-013] Replace array index keys with stable keys in table renders
- **Phase:** 1
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Replace `key={i}` with stable identity keys (`key={item.id}`) across all table renders. Index keys cause incorrect reconciliation, state bleed, and subtle UI bugs on reorder/delete.

**Acceptance criteria:**
- [ ] No `key={i}` (array index) keys remain in list/table renders
- [ ] All lists keyed by a stable unique id
- [ ] Row-level UI state behaves correctly after add/remove/reorder
- [ ] Verified across every table component

### [TICKET-014] Decouple SalesInsights auto-refresh via parent-triggered callback
- **Phase:** 1
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** SalesInsights refreshes on its own 5-minute interval, causing redundant fetches and tight coupling. Replace the internal interval with a parent-triggered refresh callback so the parent owns refresh timing. Predictable data flow and fewer wasted requests.

**Acceptance criteria:**
- [ ] Internal 5-minute interval removed from SalesInsights
- [ ] Component refreshes when the parent invokes the provided callback
- [ ] No duplicate/competing fetch loops remain
- [ ] Parent can trigger refresh on demand and on its own schedule

### [TICKET-015] Replace window.confirm() delete dialogs with styled ConfirmDialog
- **Phase:** 1
- **Priority:** Low
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** Replace native `window.confirm()` delete prompts with a reusable styled `ConfirmDialog` component. Consistent UX, accessibility, and brand-aligned styling.

**Acceptance criteria:**
- [ ] Reusable `ConfirmDialog` component (title, message, confirm/cancel, async-aware)
- [ ] All `window.confirm()` delete flows replaced
- [ ] Confirm proceeds with delete; cancel aborts; dialog is keyboard-accessible
- [ ] No native confirm dialogs remain in the codebase

---

## Phase 2 — Infrastructure

### [TICKET-016] Set up PostgreSQL and replace SQLite connection string
- **Phase:** 2
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** Provision PostgreSQL and replace the SQLite connection string with a configurable Postgres URL. SQLite cannot support concurrency, async drivers, or production scale needed for later phases.

**Acceptance criteria:**
- [ ] App connects to PostgreSQL via a configurable connection string
- [ ] SQLite connection string and references removed
- [ ] Schema creates cleanly on Postgres; existing functionality works end-to-end
- [ ] Local dev Postgres instructions documented

### [TICKET-017] Initialize Alembic with first migration (current schema + created_at)
- **Phase:** 2
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-001, TICKET-016

**Description:** Initialize Alembic and author the baseline migration capturing the current schema plus the new `created_at` column. Schema must be versioned before further structural changes.

**Acceptance criteria:**
- [ ] Alembic initialized and wired to the app's metadata/config
- [ ] Baseline migration reproduces full current schema including `orders.created_at`
- [ ] `alembic upgrade head` builds the schema from empty; `downgrade` works
- [ ] Migration documented in README/dev workflow

### [TICKET-018] Migrate FastAPI endpoints to async def with AsyncSession + asyncpg
- **Phase:** 2
- **Priority:** High
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-016

**Description:** Convert endpoints to `async def` using SQLAlchemy `AsyncSession` and the `asyncpg` driver, with an async DB dependency. Unlocks concurrency and is required for scalable LLM/IO-heavy endpoints later.

**Acceptance criteria:**
- [ ] All DB-touching endpoints are `async def` using `AsyncSession`
- [ ] `asyncpg` driver configured; async session dependency provided
- [ ] Transactions (incl. atomic create_order from TICKET-003) preserved under async
- [ ] Full test suite passes against async stack

### [TICKET-019] Create pydantic-settings config class
- **Phase:** 2
- **Priority:** High
- **Effort:** S (hours)
- **Depends on:** none

**Description:** Create a `pydantic-settings` config class loading `database_url`, `secret_key`, `cors_origins`, `tesseract_path`, and `font_path` from the environment. Centralizes configuration and removes hardcoded values (feeds CORS, font, OCR, DB work).

**Acceptance criteria:**
- [ ] Settings class loads all five values from env with validation
- [ ] CORS (TICKET-006), font (TICKET-009), and DB URL consume the settings
- [ ] Missing required settings fail fast with a clear error
- [ ] `.env.example` documents every setting

### [TICKET-020] Create users table (email, hashed_password, role, created_at, is_active)
- **Phase:** 2
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-017

**Description:** Add a `users` table with `email` (unique), `hashed_password`, `role` (admin/manager/viewer), `created_at`, and `is_active`. Foundation for authentication, RBAC, and user management.

**Acceptance criteria:**
- [ ] `users` table created via Alembic migration
- [ ] `email` unique; `role` constrained to admin/manager/viewer; `is_active` defaults true
- [ ] `created_at` server-defaulted UTC timestamp
- [ ] Corresponding ORM model and read schema (excluding password hash) exist

### [TICKET-021] Create Docker Compose stack (postgres, fastapi, nextjs)
- **Phase:** 2
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-016

**Description:** Author a Docker Compose stack with `postgres`, `fastapi`, and `nextjs` services, networked together with env wiring and volumes. Reproducible local/prod-like environment for all later work.

**Acceptance criteria:**
- [ ] `docker compose up` starts postgres, fastapi, and nextjs
- [ ] Services communicate over an internal network; DB data persists via volume
- [ ] Env vars (DB URL, secrets, API URL) injected via compose/env files
- [ ] Documented startup, with healthy service checks

### [TICKET-022] Add passlib[bcrypt] password hashing
- **Phase:** 2
- **Priority:** Critical
- **Effort:** S (hours)
- **Depends on:** TICKET-020

**Description:** Add `passlib[bcrypt]` and helpers to hash and verify passwords. Credentials must never be stored in plaintext; required by auth.

**Acceptance criteria:**
- [ ] `hash_password` and `verify_password` helpers using bcrypt
- [ ] Passwords stored only as bcrypt hashes in `users.hashed_password`
- [ ] Verification succeeds for correct and fails for incorrect passwords
- [ ] Unit tests cover hashing and verification

---

## Phase 3 — Next.js Migration + Auth

### [TICKET-023] Initialize Next.js 15 project (TypeScript, App Router)
- **Phase:** 3
- **Priority:** Critical
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** Scaffold a Next.js 15 project using TypeScript and the App Router as the new frontend foundation. The migration target for all subsequent frontend tickets.

**Acceptance criteria:**
- [ ] Next.js 15 app created with TypeScript and App Router
- [ ] Dev server builds and runs a placeholder home route
- [ ] Lint/typecheck/build scripts configured and passing
- [ ] Project structure documented

### [TICKET-024] Set up Tailwind CSS and migrate/replace existing CSS
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-023

**Description:** Install and configure Tailwind CSS, then migrate or replace existing styles. Consistent utility-based styling for the new app and white-labeling later.

**Acceptance criteria:**
- [ ] Tailwind configured and active in the Next.js app
- [ ] Existing styles migrated or intentionally replaced with Tailwind equivalents
- [ ] Global styles/theme tokens centralized
- [ ] No unused legacy CSS left dangling

### [TICKET-025] Define shared TypeScript interfaces for API response shapes
- **Phase:** 3
- **Priority:** High
- **Effort:** S (hours)
- **Depends on:** TICKET-023

**Description:** Define shared TypeScript interfaces for `Order`, `StockItem`, `AnalyticsItem`, and `User` matching backend responses. Type safety across all data fetching and components.

**Acceptance criteria:**
- [ ] Interfaces for Order, StockItem, AnalyticsItem, User in a shared types module
- [ ] Fields match backend schemas (including `created_at`, `role`, `is_active`)
- [ ] Interfaces consumed by the API wrapper and components
- [ ] No `any` used for these shapes

### [TICKET-026] Create lib/api.ts server-side fetch wrapper with internal secret header
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-023, TICKET-019

**Description:** Build `lib/api.ts`, a server-side-only fetch wrapper that calls FastAPI and attaches an internal secret header for service-to-service trust. Keeps the backend secret off the client and centralizes server fetching.

**Acceptance criteria:**
- [ ] `lib/api.ts` callable only from server context (not bundled to client)
- [ ] Requests include the internal secret header read from server env
- [ ] Typed responses using shared interfaces (TICKET-025); normalized errors
- [ ] FastAPI validates the internal secret header on protected internal calls

### [TICKET-027] Set up NextAuth v5 with Credentials provider against users table
- **Phase:** 3
- **Priority:** Critical
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-020, TICKET-022, TICKET-026

**Description:** Configure NextAuth v5 with a Credentials provider that authenticates against the PostgreSQL `users` table using bcrypt verification. Core authentication for the app.

**Acceptance criteria:**
- [ ] NextAuth v5 configured with Credentials provider
- [ ] Login verifies email + bcrypt password against `users`; inactive users rejected
- [ ] Session includes user id and role; secret/config from env
- [ ] Invalid credentials return a clear auth error without leaking detail

### [TICKET-028] Create middleware.ts for route protection
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-027

**Description:** Add `middleware.ts` that protects authenticated routes and redirects unauthenticated users to `/login`. Enforce access control at the edge before pages render.

**Acceptance criteria:**
- [ ] Unauthenticated requests to protected routes redirect to `/login`
- [ ] Authenticated users reach protected routes normally
- [ ] Public routes (login, static assets) excluded from protection
- [ ] Redirect preserves intended destination where appropriate

### [TICKET-029] Build login page with email/password form and error states
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-027

**Description:** Build the `/login` page with an email/password form, submit-to-NextAuth flow, loading and error states. User entry point for authentication.

**Acceptance criteria:**
- [ ] Login form with email/password and client validation
- [ ] Successful login establishes session and redirects to the app
- [ ] Failed login shows a clear, non-leaky error message
- [ ] Loading/disabled state during submission; accessible form labels

### [TICKET-030] Migrate WelcomePage to Next.js (app/page.tsx)
- **Phase:** 3
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** TICKET-023

**Description:** Migrate the existing WelcomePage to `app/page.tsx` in the Next.js app. First page in the migration, validates layout and routing.

**Acceptance criteria:**
- [ ] WelcomePage rendered at `app/page.tsx`
- [ ] Visual/behavioral parity with the original welcome page
- [ ] Uses Next.js layout and navigation conventions
- [ ] Builds and renders without errors

### [TICKET-031] Migrate SalesPage with Server Components for initial data fetch
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-026, TICKET-025

**Description:** Migrate SalesPage to Next.js, fetching initial data in a Server Component via `lib/api.ts`. Faster first render and secure server-side data access.

**Acceptance criteria:**
- [ ] SalesPage initial data fetched server-side via `lib/api.ts`
- [ ] Page renders with typed data and parity with the original
- [ ] Client interactivity (filters/refresh) preserved as client components
- [ ] No backend secret exposed to the client

### [TICKET-032] Migrate StockPage with Server Components for initial data fetch
- **Phase:** 3
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-026, TICKET-025

**Description:** Migrate StockPage to Next.js with server-side initial data fetching via `lib/api.ts`. Consistent SSR data pattern and parity with the legacy page.

**Acceptance criteria:**
- [ ] StockPage initial data fetched server-side via `lib/api.ts`
- [ ] Typed rendering with parity to original stock view
- [ ] Client-side mutations (update/delete) work via the API wrapper
- [ ] No backend secret exposed to the client

### [TICKET-033] Migrate all components from JSX to TSX with prop types
- **Phase:** 3
- **Priority:** Medium
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-025

**Description:** Convert all remaining components from JSX to TSX with explicit prop types using shared interfaces. End-to-end type safety and maintainability.

**Acceptance criteria:**
- [ ] All components are `.tsx` with typed props
- [ ] Shared interfaces (TICKET-025) used where applicable; no stray `any`
- [ ] Typecheck passes across the app
- [ ] No remaining `.jsx` component files

### [TICKET-034] Replace React Router Links with Next.js Links
- **Phase:** 3
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** TICKET-023

**Description:** Replace React Router `Link`/navigation with Next.js `Link` and the App Router navigation APIs. React Router is incompatible with the App Router model.

**Acceptance criteria:**
- [ ] All React Router `Link`s replaced with Next.js `Link`
- [ ] Programmatic navigation uses Next.js router APIs
- [ ] React Router dependency removed
- [ ] All in-app navigation works correctly

---

## Phase 4 — LLM Integration

### [TICKET-035] Add ANTHROPIC_API_KEY to settings and install anthropic SDK
- **Phase:** 4
- **Priority:** Critical
- **Effort:** S (hours)
- **Depends on:** TICKET-019

**Description:** Add `ANTHROPIC_API_KEY` to the settings class and install the `anthropic` SDK in the backend, with a shared client factory. Default to the latest Claude model. Foundation for all AI endpoints.

**Acceptance criteria:**
- [ ] `anthropic` SDK installed; `ANTHROPIC_API_KEY` loaded via settings
- [ ] Shared Claude client/factory available to endpoints
- [ ] Default model set to a current Claude model id, configurable via settings
- [ ] A smoke test confirms a successful API call (mocked in CI)

### [TICKET-036] Build /ai/insights endpoint (3 structured insights)
- **Phase:** 4
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-035, TICKET-002

**Description:** Build `/ai/insights` that passes aggregated sales stats (from `_aggregate_orders()`) to Claude and returns 3 structured insights, each with `title`, `description`, and `severity`. Surfaces actionable AI analysis on the dashboard.

**Acceptance criteria:**
- [ ] Endpoint feeds aggregated stats to Claude and returns exactly 3 insights
- [ ] Each insight has `title`, `description`, `severity` (validated schema)
- [ ] Malformed model output handled gracefully (retry/validation/fallback)
- [ ] Response validated with a pydantic model; covered by a test (mocked LLM)

### [TICKET-037] Build /ai/explain-risk/{item_name} endpoint
- **Phase:** 4
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-035

**Description:** Build `/ai/explain-risk/{item_name}` that generates a natural-language explanation for CRITICAL items including a restocking recommendation. Makes risk status understandable and actionable.

**Acceptance criteria:**
- [ ] Endpoint returns a clear explanation plus a restocking recommendation for the item
- [ ] Non-existent item returns 404; non-critical item handled per defined behavior
- [ ] Item context (stock, sales) passed to Claude for grounded output
- [ ] Response schema validated; test with mocked LLM

### [TICKET-038] Build /ai/chat endpoint
- **Phase:** 4
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-035

**Description:** Build `/ai/chat` accepting a user question plus current business-data context and returning Claude's answer. Backend for conversational business Q&A.

**Acceptance criteria:**
- [ ] Endpoint accepts a question and structured business-data context
- [ ] Returns Claude's answer grounded in the provided context
- [ ] Input validated; oversized context handled/truncated safely
- [ ] Errors and rate limits handled gracefully; test with mocked LLM

### [TICKET-039] Build chat UI component on the dashboard
- **Phase:** 4
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-038

**Description:** Build a dashboard chat UI for business Q&A that calls `/ai/chat`, passing current business data context. User-facing conversational interface.

**Acceptance criteria:**
- [ ] Chat UI with message history, input, send, and loading states
- [ ] Sends question + current context; renders the answer
- [ ] Error and empty states handled; accessible and styled with Tailwind
- [ ] Works within the authenticated dashboard layout

### [TICKET-040] Build /ai/reorder-suggestions endpoint
- **Phase:** 4
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-035

**Description:** Build `/ai/reorder-suggestions` that generates purchase-order recommendations based on stock levels and sales velocity. Turns analytics into concrete purchasing actions.

**Acceptance criteria:**
- [ ] Endpoint returns per-item reorder recommendations (qty + rationale)
- [ ] Recommendations driven by current stock and sales velocity inputs
- [ ] Structured, validated response schema
- [ ] Test with mocked LLM and representative data

---

## Phase 5 — ML & Smarter Analysis

### [TICKET-041] Replace static risk multiplier with days-of-stock-remaining engine
- **Phase:** 5
- **Priority:** High
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-001

**Description:** Replace the static risk multiplier with a days-of-stock-remaining engine computed from current stock and historical sales rate (uses `created_at`). Real, time-based risk instead of a fixed fudge factor.

**Acceptance criteria:**
- [ ] Risk derived from days-of-stock-remaining (stock ÷ avg daily sales)
- [ ] Static multiplier removed
- [ ] Sensible handling of zero-sales and brand-new items
- [ ] Risk tiers documented and unit-tested against fixtures

### [TICKET-042] Implement ABC classification (replace sales tier system)
- **Phase:** 5
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-002

**Description:** Implement ABC classification — A = top 20% of revenue, B = middle 30%, C = bottom 50% — replacing the current sales-tier system. Standard, revenue-weighted prioritization.

**Acceptance criteria:**
- [ ] Items classified A/B/C by cumulative revenue thresholds (20/30/50)
- [ ] Old sales-tier logic removed and replaced everywhere it was used
- [ ] Classification exposed in analytics responses/UI
- [ ] Unit tests verify boundary cases and totals

### [TICKET-043] Build demand forecasting with Facebook Prophet (30+ days history)
- **Phase:** 5
- **Priority:** Medium
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-001

**Description:** Build demand forecasting using Prophet for items with at least 30 days of history. Forward-looking demand to drive reordering and planning.

**Acceptance criteria:**
- [ ] Prophet model produces a demand forecast per eligible item (≥30 days history)
- [ ] Items with insufficient history are skipped with a clear flag
- [ ] Forecast output (horizon, point + interval) exposed via API
- [ ] Reproducible results; covered by a test on sample series

### [TICKET-044] Implement IsolationForest anomaly detection on daily sales per item
- **Phase:** 5
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-001

**Description:** Implement IsolationForest anomaly detection on per-item daily sales to flag unusual spikes/drops. Surfaces data issues and demand shocks early.

**Acceptance criteria:**
- [ ] Daily sales series built per item from order history
- [ ] IsolationForest flags anomalies with a score/threshold
- [ ] Anomalies exposed via API for UI/alerts
- [ ] Handles sparse series gracefully; tested on known-anomaly fixture

### [TICKET-045] Build reorder point calculator with per-item lead time
- **Phase:** 5
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-001

**Description:** Build a reorder point calculator: `(avg_daily_sales × lead_time_days) + safety_stock`, with per-item configurable lead time. Principled restock trigger driving alerts and POs.

**Acceptance criteria:**
- [ ] Reorder point computed per the formula using avg daily sales
- [ ] Per-item lead time configurable; safety stock configurable
- [ ] Reorder point persisted/exposed and consumable by alerts (TICKET-052)
- [ ] Unit tests cover representative items and edge cases

---

## Phase 6 — Product Polish

### [TICKET-046] Build user management UI (create/invite, roles, deactivate)
- **Phase:** 6
- **Priority:** High
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-020, TICKET-027

**Description:** Build an admin user-management UI to create/invite users, assign roles, and deactivate accounts. Admins need to manage access without DB intervention.

**Acceptance criteria:**
- [ ] List users; create/invite with email and role assignment
- [ ] Change role and toggle `is_active` (deactivate/reactivate)
- [ ] Actions restricted to admin role; reflects RBAC
- [ ] Validation and error/success states; reflects backend changes immediately

### [TICKET-047] Build email invitation and password reset flows (SMTP)
- **Phase:** 6
- **Priority:** High
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-020

**Description:** Build email invitation and password reset flows over SMTP with secure, expiring tokens. Complete onboarding and account recovery.

**Acceptance criteria:**
- [ ] SMTP configured via settings; invitation and reset emails sent
- [ ] Tokens are single-use, expiring, and securely stored/validated
- [ ] Invite sets initial password; reset updates the bcrypt hash
- [ ] Expired/invalid tokens handled with clear errors; flows tested

### [TICKET-048] Create audit_log table and middleware (before/after values)
- **Phase:** 6
- **Priority:** High
- **Effort:** L (3–5 days)
- **Depends on:** TICKET-017

**Description:** Create an `audit_log` table and middleware recording every create/update/delete with user, timestamp, and before/after values. Accountability and traceability required for ERP.

**Acceptance criteria:**
- [ ] `audit_log` table (entity, action, user, timestamp, before, after) via migration
- [ ] Middleware/hook records all create/update/delete operations
- [ ] Captures actor identity and before/after state for updates
- [ ] Writes do not break the originating transaction; covered by tests

### [TICKET-049] Build audit log viewer in admin panel
- **Phase:** 6
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-048

**Description:** Build an admin audit-log viewer with filtering (by user, entity, action, date) and before/after diffs. Makes audit data usable.

**Acceptance criteria:**
- [ ] Paginated audit-log list with filters (user/entity/action/date range)
- [ ] Before/after values viewable per entry (diff-friendly)
- [ ] Admin-only access
- [ ] Performs acceptably on large logs (server-side pagination)

### [TICKET-050] Build CSV export for orders, stock, and analytics (with filters)
- **Phase:** 6
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** none

**Description:** Build CSV export for orders, stock, and analytics tables that respects the currently applied filters. Users need data extraction for reporting.

**Acceptance criteria:**
- [ ] Export buttons for orders, stock, and analytics
- [ ] Exported CSV reflects active filters/columns shown
- [ ] Correct headers, escaping, and encoding for large datasets
- [ ] Streamed/efficient generation; verified row counts match filtered view

### [TICKET-051] Build PDF weekly/monthly report generation with reportlab
- **Phase:** 6
- **Priority:** Medium
- **Effort:** L (3–5 days)
- **Depends on:** none

**Description:** Build weekly/monthly PDF report generation using reportlab (sales summary, stock status, key insights). Shareable periodic reporting for stakeholders.

**Acceptance criteria:**
- [ ] Generate PDF reports for a selectable weekly/monthly period
- [ ] Reports include sales summary, stock/risk status, and key metrics
- [ ] Consistent layout/branding; renders correctly on Linux/containers
- [ ] Downloadable via API/UI; covered by a generation test

### [TICKET-052] Build low-stock email alert system (triggered at reorder point)
- **Phase:** 6
- **Priority:** High
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-045, TICKET-047

**Description:** Build a low-stock email alert that fires when an item crosses its reorder point. Proactive restocking before stockouts.

**Acceptance criteria:**
- [ ] Alert triggers when current stock crosses the reorder point (TICKET-045)
- [ ] Email sent via SMTP to configured recipients/roles
- [ ] De-duplication so a single crossing doesn't spam repeated emails
- [ ] Alert events logged; tested with a simulated crossing

### [TICKET-053] Build in-app notification system for stock alerts
- **Phase:** 6
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-045

**Description:** Build an in-app notification system surfacing stock alerts (and related events) with read/unread state. In-product visibility complementing email.

**Acceptance criteria:**
- [ ] Notifications generated on stock-alert events; persisted per user/role
- [ ] In-app indicator with unread count; mark-as-read supported
- [ ] Notifications list view with relevant context/links
- [ ] No duplicate notifications for a single triggering event

### [TICKET-054] Create settings table for white-labeling
- **Phase:** 6
- **Priority:** Medium
- **Effort:** S (hours)
- **Depends on:** TICKET-017

**Description:** Create a `settings` table for white-labeling: `company_name`, `logo_url`, `accent_color`, `currency`, `timezone`. Storage backing tenant/brand customization.

**Acceptance criteria:**
- [ ] `settings` table created via migration with the five fields
- [ ] Sensible defaults seeded; values readable/updatable via API
- [ ] Update restricted to admin role
- [ ] Validation (e.g., color format, timezone) enforced

### [TICKET-055] Apply white-label settings to Next.js layout at startup
- **Phase:** 6
- **Priority:** Medium
- **Effort:** M (1–2 days)
- **Depends on:** TICKET-054

**Description:** Apply white-label settings (company name, logo, accent color, currency, timezone) to the Next.js layout, loaded server-side at startup/render. Brand customization visible throughout the app.

**Acceptance criteria:**
- [ ] Layout reflects company name and logo from settings
- [ ] Accent color applied via theme/Tailwind tokens
- [ ] Currency and timezone applied to formatting across the app
- [ ] Settings fetched server-side; changes appear after update without code edits

### [TICKET-056] Build Suppliers module (Supplier, PurchaseOrder, PurchaseOrderItem CRUD)
- **Phase:** 6
- **Priority:** Medium
- **Effort:** XL (1+ week)
- **Depends on:** TICKET-017, TICKET-018

**Description:** Build a Suppliers module with `Supplier`, `PurchaseOrder`, and `PurchaseOrderItem` entities and full CRUD across backend and UI. Closes the procurement loop, connecting reorder suggestions to actual purchasing.

**Acceptance criteria:**
- [ ] Migrations and models for Supplier, PurchaseOrder, PurchaseOrderItem with relationships
- [ ] Full CRUD endpoints with validation and RBAC
- [ ] UI to manage suppliers and create/view/edit purchase orders with line items
- [ ] PO totals computed correctly; integrates with reorder suggestions (TICKET-040)
