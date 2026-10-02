const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitizePkg = require('express-mongo-sanitize');
const { sanitize: sanitizeMongoPayload } = mongoSanitizePkg;
const rateLimit = require('express-rate-limit');
const ApiError = require('./utils/ApiError');

const app = express();

// Security headers
app.use(helmet());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// AI Generation Rate Limiting (Stricter)
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit to 30 generations per hour per IP to prevent abuse
  message: { success: false, message: 'Too many generation requests, please try again later.' }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Sanitize against NoSQL injection (in-place only — Express 5 makes req.query read-only)
app.use((req, res, next) => {
  if (req.body) sanitizeMongoPayload(req.body);
  if (req.params) sanitizeMongoPayload(req.params);
  if (req.query) sanitizeMongoPayload(req.query);
  next();
});

app.use(express.static('public'));
app.use(cookieParser());

const authRouter = require('./routes/auth.routes');
const noteRouter = require('./routes/note.routes');
const dashboardRouter = require('./routes/dashboard.routes');

// Routes declaration
app.use('/api/auth', authRouter);
// Apply strict limiter to notes endpoints specifically generation
app.use('/api/notes/generate', generationLimiter);
app.use('/api/notes', noteRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 middleware
app.use((req, res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

// Centralized error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
