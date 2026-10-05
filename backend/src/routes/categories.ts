import { Router } from 'express';
import { Category } from '../models/Category.js';

const r = Router();
r.get('/', async (_req, res) => { res.json(await Category.find().sort({ name: 1 }).lean()); });
export default r;
