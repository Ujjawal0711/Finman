import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { app } from './app.js';
import { ensureSeeded } from './services/seed.js';

await connectDb();
await ensureSeeded();
app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`));
