# EngineeringHub — Deployment & Operations Guide

## 1. Overview
EngineeringHub is designed for flexible deployment across containerized environments (Docker Compose, Kubernetes, AWS ECS) or traditional Linux VMs (Ubuntu, Debian).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` and configure production parameters:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `PORT` | Yes | Port backend API listens on | `4000` |
| `NODE_ENV` | Yes | Node environment (`development`, `production`, `test`) | `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin for frontend | `https://hub.example.com` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/engineeringhub` |
| `JWT_SECRET` | Yes | 32+ character high-entropy key for user session signing | `prod_jwt_secret_min_32_characters!` |
| `ENCRYPTION_KEY` | Yes | 64-character (32-byte) hex string for AES-256-GCM token encryption | `0123456789abcdef...` |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth Application Client ID | `Iv1.xxxxxxxxxxxx` |
| `GITHUB_CLIENT_SECRET`| Optional | GitHub OAuth Application Client Secret | `xxxxxxxxxxxxxxxx` |
| `GITHUB_WEBHOOK_SECRET`| Optional| Secret string for HMAC SHA-256 webhook verification | `webhook_secret_string` |
| `REDIS_URL` | Optional | Redis connection URL for BullMQ queue | `redis://localhost:6379` |

---

## 3. Production Deployment via Docker Compose (Recommended)

### Prerequisites
* Docker Engine 24+
* Docker Compose 2.20+

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/balamurugan07s/AcademicFlow.git engineeringhub
   cd engineeringhub
   ```

2. **Supply Production Credentials**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual database passwords and JWT secrets
   ```

3. **Build and Launch Containers**:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker-compose ps
   ```
   Containers `engineeringhub-postgres`, `engineeringhub-redis`, and `engineeringhub-backend` should report status `healthy`.

5. **Verify API Health Endpoints**:
   ```bash
   curl http://localhost:4000/api/health
   curl http://localhost:4000/api/ready
   ```

---

## 4. Manual Deployment (Bare Metal / VM)

### Prerequisites
* Node.js 22+ & npm
* PostgreSQL 16+
* Redis 7+ (Optional)

### Steps

1. **Install Dependencies**:
   ```bash
   cd backend
   npm ci
   ```

2. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build TypeScript Application**:
   ```bash
   npm run build
   ```

4. **Start Production Service with PM2 or systemd**:
   ```bash
   npm start
   ```

---

## 5. Health Probes & Monitoring
* **Liveness Probe**: `GET /api/health` returns HTTP 200 with uptime and service name.
* **Readiness Probe**: `GET /api/ready` tests active database connectivity. If PostgreSQL is unreachable, returns HTTP 503 Service Unavailable.
