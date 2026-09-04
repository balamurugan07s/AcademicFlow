# Contributing to EngineeringHub

Thank you for contributing to EngineeringHub! Please follow these guidelines to ensure code quality, architectural consistency, and security integrity.

---

## 1. Engineering Principles
* **Real > Large**: Never invent mock APIs or simulated external features under the guise of real data.
* **Security First**: Never commit API keys, tokens, or plaintext secrets.
* **Test Every Feature**: Every new endpoint or service must have automated unit or integration tests.
* **Tenant Isolation**: Every database query must be scoped to `organization_id`.

---

## 2. Local Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/balamurugan07s/AcademicFlow.git
   cd AcademicFlow/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp ../.env.example .env
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Run Tests**:
   ```bash
   npm test
   ```

6. **Start Dev Server**:
   ```bash
   npm run dev
   ```

---

## 3. Pull Request Requirements
Before submitting a pull request, ensure:
1. `npx tsc --noEmit` passes with 0 compiler errors.
2. `npm test` passes 100% of automated tests.
3. Relevant architectural changes are recorded in `DECISIONS.md`.
4. `IMPLEMENTATION_STATUS.md` is updated.
