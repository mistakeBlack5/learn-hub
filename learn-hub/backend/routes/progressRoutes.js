import express from 'express';
import { getCourseProgress, completeLesson } from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // Progress is private
router.get('/:courseId', getCourseProgress);
router.post('/complete', completeLesson);

export default router;