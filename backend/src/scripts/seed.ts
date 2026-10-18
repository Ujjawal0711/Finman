// npm run seed            categories and logins
// npm run seed -- --demo 60  also inserts 60 sample transactions
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Category } from '../models/Category.js';
import { ParseLog } from '../models/ParseLog.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { seedCategories, seedDemo, seedLogins } from '../services/seed.js';

await connectDb();
await seedCategories();

const i = process.argv.indexOf('--demo');
if (i !== -1) await seedDemo(Number(process.argv[i + 1]) || 60);

await seedLogins();
await Promise.all([Transaction.syncIndexes(), Category.syncIndexes(), User.syncIndexes(), ParseLog.syncIndexes()]);
await mongoose.disconnect();
