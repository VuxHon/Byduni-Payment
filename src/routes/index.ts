import { Router } from 'express';
import paymentRoutes from './payment.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Áp dụng auth middleware cho tất cả các routes
router.use(authMiddleware);

router.use('/payments', paymentRoutes);

export default router;

