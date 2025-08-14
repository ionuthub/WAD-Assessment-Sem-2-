// Entry point for DiscoverHealth app (Express 4)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import resourcesRouter from './routes/resources.js';
import usersRouter from './routes/users.js';
import reviewsRouter from './routes/reviews.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// basic rate limiter: 100 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'discover-health-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// API routes
app.use('/api/resources', resourcesRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);

// Global error handler
app.use(errorHandler);

// React build static
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DiscoverHealth server listening on port ${PORT}`);
});

export default app;
