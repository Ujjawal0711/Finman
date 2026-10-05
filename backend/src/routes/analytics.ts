import { Router } from 'express';
import { categories, daily } from '../controllers/analyticsController.js';

const r = Router();
r.get('/daily', daily);
r.get('/categories', categories);
export default r;
