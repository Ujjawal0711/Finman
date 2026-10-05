import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import entries from './routes/entries.js';
import parser from './routes/parser.js';
import analytics from './routes/analytics.js';
import categories from './routes/categories.js';
import exportRoutes from './routes/export.js';

export const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});
app.use('/api/entries', entries);
app.use('/api/parse', parser);
app.use('/api/analytics', analytics);
app.use('/api/categories', categories);
app.use('/api/export', exportRoutes);

app.use('/api', (_req, res) => { res.status(404).json({ error: { message: 'Not found' } }); });
app.use(errorHandler);
