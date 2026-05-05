import express from 'express';
import { getCourses, getCourseById, createCourse } from '../controllers/courseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, authorize('admin', 'instructor'), createCourse);

export default router;