import { z } from 'zod';

try { process.loadEnvFile(); } catch { /* no .env in production; the host injects vars */ }

export const env = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().startsWith('mongodb'),
  MONGODB_DB: z.string().default('finman'),
  HF_TOKEN: z.string().startsWith('hf_'),
  HF_MODEL: z.string(),
  HF_VISION_MODEL: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
}).parse(process.env);

export const TZ = 'Asia/Kolkata';
