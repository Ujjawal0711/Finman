import { z } from 'zod';

try { process.loadEnvFile(); } catch { /* no .env in production; the host injects vars */ }

const raw = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().startsWith('mongodb'),
  MONGODB_DB: z.string().default('finman'),
  // Any OpenAI-compatible chat API: Groq, Hugging Face's router, OpenRouter, a local Ollama...
  AI_BASE_URL: z.string().url().default('https://router.huggingface.co/v1'),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).optional(),
  AI_VISION_MODEL: z.string().min(1).optional(),
  // older names, still accepted when the AI_* ones are absent
  HF_TOKEN: z.string().min(1).optional(),
  HF_MODEL: z.string().min(1).optional(),
  HF_VISION_MODEL: z.string().min(1).optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  // optional second login for demos and the viva
  DEMO_EMAIL: z.string().email().optional(),
  DEMO_PASSWORD: z.string().min(6).optional(),
}).parse(process.env);

const AI_API_KEY = raw.AI_API_KEY ?? raw.HF_TOKEN;
const AI_MODEL = raw.AI_MODEL ?? raw.HF_MODEL;
if (!AI_API_KEY || !AI_MODEL) {
  throw new Error('Set AI_API_KEY and AI_MODEL in backend/.env (see .env.example)');
}

export const env = {
  ...raw,
  AI_BASE_URL: raw.AI_BASE_URL.replace(/\/+$/, ''),
  AI_API_KEY,
  AI_MODEL,
  AI_VISION_MODEL: raw.AI_VISION_MODEL ?? raw.HF_VISION_MODEL,
};

export const TZ = 'Asia/Kolkata';
