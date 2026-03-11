require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const sellersRoutes = require('./routes/sellers');
const linksRoutes = require('./routes/links');
const redirectRoutes = require('./routes/redirect');
const leadsRoutes = require('./routes/leads');
const orgsRoutes = require('./routes/orgs');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
});
app.use(limiter);

// Separate limiter for redirect (anti-abuse)
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => req.ip + req.params.slug,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/leads', leadsRoutes);

// Redirect route (separate — no /api prefix)
app.use('/r', redirectLimiter, redirectRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Só inicia o servidor HTTP localmente (não no Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 RotaLead API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
