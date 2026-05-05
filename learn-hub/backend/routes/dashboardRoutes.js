import express from 'express';
import { 
  getDashboardStats, 
  getEnrolledCourses, 
  enrollInCourse 
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/stats', getDashboardStats);
router.get('/courses', getEnrolledCourses);
router.post('/enroll', enrollInCourse);

export default router;