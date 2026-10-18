import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { COOKIE, cookieOptions, signToken, verifyPassword } from '../services/auth.js';

const credentials = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

const r = Router();

r.post('/login', async (req, res) => {
  const { email, password } = credentials.parse(req.body);
  const user = await User.findOne({ email });
  // same message either way, so the endpoint doesn't reveal which emails exist
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw new HttpError(401, 'Wrong email or password');
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie(COOKIE, signToken({ sub: String(user._id), email: user.email }), cookieOptions);
  res.json({ email: user.email });
});

// One-click demo sign-in for graders. The password never reaches the browser: the server signs in
// as DEMO_EMAIL itself, and the route only exists when a demo account is configured in .env.
const demoEnabled = () => Boolean(env.DEMO_EMAIL && env.DEMO_PASSWORD);

r.get('/demo', (_req, res) => {
  res.json({ enabled: demoEnabled(), email: demoEnabled() ? env.DEMO_EMAIL : null });
});

r.post('/demo', async (_req, res) => {
  if (!demoEnabled()) throw new HttpError(404, 'The demo account is not set up');
  const user = await User.findOne({ email: env.DEMO_EMAIL!.toLowerCase() });
  if (!user) throw new HttpError(404, 'The demo account has not been created yet. Run npm run seed');
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie(COOKIE, signToken({ sub: String(user._id), email: user.email }), cookieOptions);
  res.json({ email: user.email });
});

r.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});

r.get('/me', requireAuth, (_req, res) => {
  res.json({ email: res.locals.user.email });
});

export default r;
