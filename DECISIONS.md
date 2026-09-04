# EngineeringHub — Architecture Decision Records (ADR)

This document records the foundational architectural, security, database, and operational decisions for EngineeringHub, adhering to standard ADR structure: Context, Options Considered, Chosen Approach, Rationale, Trade-offs, and Consequences.

---

## ADR-001: Modular Monolith with Decoupled Background Worker vs. Microservices

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Principal Software Architect, Senior Backend Engineer

### Context
EngineeringHub requires a high-throughput API to serve dashboard views and receive webhooks, alongside an asynchronous execution layer for computationally heavy tasks (large repository baseline synchronization, webhook payload parsing, periodic metrics rollups). We need to select an architectural topology that maximizes reliability, simplifies local developer workflow, prevents deployment overhead, and is defensible in CSE technical interviews.

### Options Considered
1. **Distributed Microservices**: Splitting into Auth Service, Ingestion Service, Analytics Service, Webhook Service, and API Gateway using gRPC/Kafka.
2. **Next.js Full-Stack App (Server Actions / Route Handlers only)**: Hosting everything within Next.js API routes on serverless functions.
3. **Modular Monolith + Decoupled Background Worker**: A unified Express/TypeScript backend managing API routes, domain modules, and middleware, paired with a dedicated background worker process running BullMQ/Redis.

### Chosen Approach
**Option 3: Modular Monolith + Decoupled Background Worker.**

### Rationale
* Microservices introduce distributed transaction overhead, network latency, complex local development prerequisites, and container sprawl without a traffic justification.
* Serverless/Next.js route handlers suffer from cold starts and strict execution timeout limits (10–15s), making them unsuitable for long-running GitHub repo syncs and sustained webhook bursts.
* A modular monolith maintains clear code boundaries, allows rapid refactoring, shares database schemas and types natively, and allows running worker tasks in a separate OS process without network serialization boundaries.

### Trade-offs & Consequences
* **Trade-off**: The API and Worker share codebase dependencies.
* **Consequence**: Independent scaling is achieved by deploying the same container image with different start commands (`npm run start:api` vs. `npm run start:worker`).

---

## ADR-002: Backend API Framework Selection

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Principal Architect, Backend Engineer

### Context
We need a robust, performant, and transparent backend framework in TypeScript to implement authentication, custom tenant middleware, RBAC guards, and Zod input validation.

### Options Considered
1. **NestJS**: Highly structured, Angular-inspired framework with dependency injection and decorators.
2. **Fastify**: High-performance Node.js framework with schema-based serialization.
3. **Express.js with TypeScript**: Standard, minimalistic, transparent HTTP framework.

### Chosen Approach
**Option 3: Express.js with TypeScript.**

### Rationale
* Express provides explicit, inspectable middleware pipelines. In CSE placement interviews, explaining and tracing `req -> rateLimiter -> auth -> tenantContext -> rbac -> validator -> controller` is clear and direct, without framework magic or hidden dependency injection reflection.
* TypeScript ensures full type safety across route parameters, request bodies, and database types.
* Wide ecosystem support and mature testing ergonomics with Supertest.

### Trade-offs & Consequences
* **Trade-off**: Express lacks built-in architecture scaffolding compared to NestJS.
* **Consequence**: We establish a strict directory convention (`controllers/`, `services/`, `middlewares/`, `routes/`, `validators/`) to guarantee maintainability.

---

## ADR-003: Multi-Tenancy Isolation Architecture

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Security Engineer, Database Engineer

### Context
EngineeringHub is a multi-tenant platform where multiple organizations store proprietary code metadata. Data from Organization A must never leak to Organization B, even if malicious users manipulate URL parameters or query IDs.

### Options Considered
1. **Database-per-Tenant**: Provisioning an isolated PostgreSQL database for each organization.
2. **Schema-per-Tenant**: A single PostgreSQL database with separate PostgreSQL schemas (`schema_orgA`, `schema_orgB`).
3. **Row-Level Logical Isolation (Shared Database, Shared Schema)**: Every operational table contains an indexed `organization_id` foreign key, enforced via mandatory application middleware and parameterized queries.

### Chosen Approach
**Option 3: Row-Level Logical Isolation.**

### Rationale
* Database-per-tenant and Schema-per-tenant create severe connection pooling bottlenecks, complex migrations (migrating 100+ schemas independently), and substantial infrastructure cost.
* Row-level multi-tenancy with composite indexes (`organization_id`, `created_at DESC`) scales to thousands of tenants efficiently within a single connection pool.
* Automated integration tests explicitly verify that cross-tenant queries return 404/403.

### Trade-offs & Consequences
* **Trade-off**: Security relies on application-level enforcement rather than physical network/database separation.
* **Consequence**: Mandatory `tenantContext` middleware extracts the active tenant, and all database service methods require `organization_id` in their query filters. Unit and security tests will enforce this invariant.

---

## ADR-004: Relational Persistence and ORM

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Database Engineer, Full-Stack Engineer

### Context
The application domain is relational: Users, Organizations, Repositories, Commits, Pull Requests, Issues, and Audit Logs have strict foreign key relationships and require ACID transactional guarantees.

### Options Considered
1. **MongoDB / Document Store**: NoSQL flexible document model.
2. **PostgreSQL 16 + Prisma ORM**: Relational SQL engine with type-safe client generation.
3. **PostgreSQL 16 + Raw SQL / Knex**: Query builder without ORM abstraction.

### Chosen Approach
**Option 2: PostgreSQL 16 + Prisma ORM.**

### Rationale
* Developer data is inherently relational: a PR belongs to a Repository, which belongs to an Organization, and contains multiple Commits. Foreign keys, check constraints, and relational joins are mandatory.
* Prisma provides automated migration generation (`prisma migrate`), type-safe queries generated from the schema, and protection against SQL injection via parameterized queries.

### Trade-offs & Consequences
* **Trade-off**: High-volume metric aggregations can sometimes produce complex queries with ORMs.
* **Consequence**: For performance-critical analytical rollups, we utilize Prisma's `$queryRaw` with strict parameterization while using standard Prisma client methods for transactional and CRUD operations.

---

## ADR-005: Asynchronous Queue & Background Worker Architecture

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Senior Backend Engineer, DevOps Engineer

### Context
GitHub API rate limits, large repository baseline fetches (hundreds of commits/PRs), and webhook ingestion spikes must not block the synchronous HTTP request-response cycle.

### Options Considered
1. **Synchronous In-Request Processing**: Fetching GitHub data inside HTTP request handlers.
2. **Kafka / RabbitMQ Cluster**: Enterprise message streaming brokers.
3. **BullMQ + Redis with Resilient Fallback**: Redis-backed distributed queue engine supporting job delays, exponential backoff retries, and dead-letter queues.

### Chosen Approach
**Option 3: BullMQ + Redis.**

### Rationale
* Synchronous in-request processing causes HTTP timeouts (GitHub webhooks timeout after 10 seconds).
* Kafka is overengineered for our throughput requirements and requires excessive operational memory.
* BullMQ is the Node.js standard for Redis queues: lightweight, reliable, supports concurrency limits, retries, and event hooks.
* In local environments where Redis is not running, the application includes a clean in-process queue adapter fallback to ensure rapid development and testing without mandatory Redis startup.

### Trade-offs & Consequences
* **Trade-off**: Introduces Redis as an infrastructure dependency in production.
* **Consequence**: Redis is containerized in `docker-compose.yml` with health checks, and readiness probes verify Redis connectivity.

---

## ADR-006: Webhook Security & Replay Prevention

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Security Engineer, Architect

### Context
Anyone on the public internet can send HTTP POST requests to `/api/webhooks/github`. We must guarantee authenticity (payload originated from GitHub) and idempotency (duplicate deliveries are not re-processed).

### Options Considered
1. **IP Allowlisting**: Restricting incoming traffic to GitHub's published IP blocks (`api.github.com/meta`).
2. **HMAC SHA-256 Signature Verification + Delivery ID Deduplication Store**.

### Chosen Approach
**Option 2: HMAC SHA-256 Timing-Safe Signature Verification + Delivery ID Store.**

### Rationale
* GitHub's IP addresses change dynamically, making IP allowlisting brittle and prone to service disruptions.
* GitHub signs every webhook payload using a shared secret via HMAC SHA-256 sent in the `X-Hub-Signature-256` header.
* Replay attacks and duplicate webhook retries are eliminated by capturing GitHub's `X-GitHub-Delivery` GUID and checking the `webhook_events` table before processing.

### Trade-offs & Consequences
* **Trade-off**: Requires raw request body buffering to compute the HMAC hash before JSON parsing.
* **Consequence**: The webhook route uses `express.raw({ type: 'application/json' })` to preserve the exact raw byte stream for cryptographic validation.

---

## ADR-007: Credential Protection & Encryption at Rest

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Security Engineer

### Context
Users authenticate via GitHub OAuth, granting OAuth access tokens that can access private repositories. Storing these tokens in plaintext in PostgreSQL poses an unacceptable data breach risk.

### Options Considered
1. **Plaintext Database Storage**: Storing access tokens directly in `accounts.access_token`.
2. **Hashing (SHA-256)**: Storing a one-way hash.
3. **Symmetric Field-Level Encryption (AES-256-GCM)**: Encrypting tokens prior to database persistence and decrypting only in memory when calling GitHub API.

### Chosen Approach
**Option 3: Symmetric Field-Level Encryption (AES-256-GCM).**

### Rationale
* Plaintext storage violates basic security standards.
* Hashing is irreversible; the application needs the plaintext token to authenticate outgoing calls to `api.github.com`.
* AES-256-GCM provides authenticated encryption with an initialization vector (IV) and authentication tag, preventing tampering and exposure if database dumps are compromised.

### Trade-offs & Consequences
* **Trade-off**: CPU overhead on token encryption/decryption and key management requirements.
* **Consequence**: `ENCRYPTION_KEY` is mandatory in `.env`. Startup validation crashes if the key is missing or invalid.

---

## ADR-008: External Integration Honesty & Zero Synthetic Data

* **Status**: Accepted
* **Date**: 2026-09-04
* **Deciders**: Product Manager, Principal Architect

### Context
Portfolios frequently fabricate mock API responses, pretend OAuth is connected, or create randomized "developer productivity scores." EngineeringHub must maintain 100% engineering honesty.

### Options Considered
1. **Pretend Connected**: Hardcoding fake repositories and fake PRs into the dashboard.
2. **Explicit State Boundaries**:
   * If credentials exist: Connect to real GitHub.
   * If credentials missing: Display `CONFIGURATION REQUIRED` with step-by-step setup guide.
   * If demo data is triggered: Explicitly tag all records as `[DEMO DATA]`.

### Chosen Approach
**Option 2: Explicit State Boundaries.**

### Rationale
* In technical interviews, explaining real failure modes, rate limits, and webhook retries demonstrates genuine engineering competence. Fake features collapse under basic scrutiny.
* Transparent demarcation builds recruiter trust and aligns with industry best practices.
