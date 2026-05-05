import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  updateUserRole 
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);

export default router;