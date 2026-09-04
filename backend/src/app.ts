import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { orgRouter } from './routes/org.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { githubRouter } from './routes/github.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { securityRouter } from './routes/security.routes.js';
import { notificationRouter } from './routes/notification.routes.js';

export const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS allowlisting
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// 3. Body Parsing (JSON with rawBody capture for cryptographic signature validation)
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// 4. Rate Limiting for general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
});

// 5. Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    });
  });
  next();
});

// 6. Mount API Routes
app.use('/api', healthRouter);
app.use('/api', webhookRouter); // Webhook endpoint without standard browser rate limit
app.use('/api', apiLimiter, githubRouter);
app.use('/api', apiLimiter, analyticsRouter);
app.use('/api', apiLimiter, securityRouter);
app.use('/api', apiLimiter, notificationRouter);
app.use('/api/auth', apiLimiter, authRouter);
app.use('/api/organizations', apiLimiter, orgRouter);

// 7. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// 8. Centralized Error Handler
app.use(errorHandler);
