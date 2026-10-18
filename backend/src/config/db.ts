import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from './env.js';

// MONGODB_URI=local starts a built-in one-node replica set, so the project runs without installing MongoDB.
// It is a replica set because multi-document transactions need one, and it keeps its data on disk in
// backend/.finman-data so entries survive restarts. Port 27027 avoids clashing with a MongoDB on 27017.
const LOCAL_PORT = 27027;

async function startBuiltInMongo() {
  const { MongoMemoryReplSet } = await import('mongodb-memory-server');
  const dbPath = fileURLToPath(new URL('../../.finman-data', import.meta.url));
  mkdirSync(dbPath, { recursive: true });
  console.log('Starting the built-in MongoDB (first start can take a minute)...');
  const rs = await MongoMemoryReplSet.create({
    replSet: { count: 1, name: 'rs0', storageEngine: 'wiredTiger' },
    instanceOpts: [{ port: LOCAL_PORT, dbPath }],
  });
  const stop = () => rs.stop({ doCleanup: false }).finally(() => process.exit(0));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return rs.getUri();
}

export async function connectDb() {
  mongoose.set('strictQuery', true);
  const uri = env.MONGODB_URI === 'local' ? await startBuiltInMongo() : env.MONGODB_URI;
  await mongoose.connect(uri, { dbName: env.MONGODB_DB });
  console.log(`MongoDB connected: ${mongoose.connection.name}${env.MONGODB_URI === 'local' ? ' (built-in)' : ''}`);
}
