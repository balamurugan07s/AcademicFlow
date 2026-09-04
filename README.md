# EngineeringHub — Developer Engineering Command Center

> A production-oriented, multi-tenant developer engineering command center providing centralized visibility into repository activity, pull request velocity, CI/CD pipelines, security findings, and DORA delivery metrics.

[![CI/CD](https://github.com/balamurugan07s/AcademicFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/balamurugan07s/AcademicFlow/actions)
[![Tests](https://img.shields.io/badge/tests-50%20passed-brightgreen.svg)](TESTING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 1. Problem & Core Value
Software engineering teams often lose visibility as projects scale across multiple microservices and GitHub repositories. Critical engineering metrics—PR cycle time, review latency, failing GitHub Actions builds, exposed secrets, and deployment frequency—remain fragmented.

**EngineeringHub** acts as an **intelligence and visibility layer** on top of GitHub workflows. It ingests developer activity asynchronously via verified webhooks and translates raw events into actionable engineering insights without replacing GitHub or specialized CI tools.

---

## 2. Key Capabilities

* **Multi-Tenancy & RBAC**: Organization-based tenant boundaries with 5 hierarchical roles (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`, `SECURITY_ANALYST`).
* **Real GitHub Integration**: Real GitHub OAuth 2.0 handshake, repository discovery, and paginated synchronization (commits, PRs, issues, releases).
* **Cryptographic Webhook Engine**: Timing-safe HMAC SHA-256 signature verification (`X-Hub-Signature-256`) and delivery deduplication preventing replay attacks.
* **Decoupled Asynchronous Queue**: Offloads expensive syncs and webhook parsing to background worker queues, returning HTTP 202 Accepted in under 50ms.
* **DORA Delivery Metrics**: Real calculations for Deployment Frequency, Lead Time for Changes, and Change Failure Rate with 100% transparent formula documentation.
* **Security Center**: CVE dependency vulnerability scanner and hardcoded secret detector (AWS keys, GitHub tokens, private RSA keys) with RBAC triage workflows.
* **Audit Logging**: Immutable audit trail of administrative, security, and membership events.
* **Honest Integration Standards**: Explicit `CONFIGURATION REQUIRED` states when credentials are not supplied, and clearly labeled `[DEMO DATA]` seeds for local evaluation.

---

## 3. System Architecture

```text
                     +---------------------------------------+
                     |         Browser / Client              |
                     |     (Next.js App Router UI)          |
                     +-------------------+-------------------+
                                         |
                                         | HTTPS / REST
                                         v
                     +---------------------------------------+
                     |            Express API                |
                     |  - Rate Limiter & Helmet              |
                     |  - Authentication & JWT Middleware   |
                     |  - Tenant Scoping & RBAC Middleware  |
                     |  - Zod Request Validation             |
                     +---------+-------------------+---------+
                               |                   |
                     Database  |                   | Push Job
                     Queries   |                   v
                               |           +---------------+
                               |           |  BullMQ Queue |
                               |           |    (Redis)    |
                               |           +-------+-------+
                               v                   |
                     +-------------------+         | Pop Job
                     |    PostgreSQL     |<--------+
                     |  - Tenants        |         |
                     |  - Repositories   |         v
                     |  - Commits & PRs  | +---------------+
                     |  - Webhook Events | | Background    |
                     |  - Audit Logs     | | Worker Engine |
                     +-------------------+ +-------+-------+
                                                   |
                                                   | Fetch / Sync
                                                   v
                                         +-------------------+
                                         |    GitHub API     |
                                         |  (REST / GraphQL) |
                                         +-------------------+
```

---

## 4. Tech Stack

* **Backend**: Node.js 22+, Express.js, TypeScript, Zod.
* **Database & ORM**: PostgreSQL 16 + Prisma ORM.
* **Queue & Cache**: BullMQ + Redis 7 (with zero-dependency test store fallback).
* **Security**: AES-256-GCM token encryption, bcrypt password hashing, timingSafeEqual HMAC comparison.
* **Testing**: Vitest, Supertest (50 automated unit, integration, and security tests).
* **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD.

---

## 5. Quickstart & Local Setup

### 1. Clone & Configure
```bash
git clone https://github.com/balamurugan07s/AcademicFlow.git engineeringhub
cd engineeringhub
cp .env.example .env
```

### 2. Run with Docker Compose
```bash
docker-compose up -d --build
```
Containers will initialize and report healthy status on ports:
* Backend API: `http://localhost:4000`
* PostgreSQL: `localhost:5432`
* Redis: `localhost:6379`

### 3. Local Development (without Docker)
```bash
cd backend
npm install
npx prisma generate
npm test          # Run all 50 automated tests
npm run dev       # Start development server on port 4000
```

---

## 6. Verification & Automated Tests

EngineeringHub includes **50 automated tests** covering authentication, tenant isolation, RBAC privilege escalation, HMAC webhook validation, and metric calculations:

```bash
cd backend
npm test
```

```text
 Test Files  11 passed (11)
      Tests  50 passed (50)
   Duration  9.22s
```

Detailed test coverage documentation is available in [TESTING.md](TESTING.md).

---

## 7. Documentation Index

* [ARCHITECTURE.md](ARCHITECTURE.md) — Comprehensive system architecture and diagrams.
* [DATABASE.md](DATABASE.md) — Relational schema, ERD, and data dictionary.
* [API.md](API.md) — REST API endpoints catalog and request/response specifications.
* [SECURITY.md](SECURITY.md) — Security model, threat analysis, and cryptographic defenses.
* [TESTING.md](TESTING.md) — Automated testing matrix and verification results.
* [DEPLOYMENT.md](DEPLOYMENT.md) — Production operations and Docker guide.
* [DECISIONS.md](DECISIONS.md) — Architecture Decision Records (ADR-001 to ADR-008).
* [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md) — CSE technical placement defense guide.
* [LIMITATIONS.md](LIMITATIONS.md) — Honest system boundaries and configuration dependencies.
* [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) — Progress tracking and completed milestones.
