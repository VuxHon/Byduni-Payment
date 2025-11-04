import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/', paymentController.createPayment);
router.post('/get_status_payment_info', paymentController.getPaymentStatusInfo);
router.get('/get_payment_info_list', paymentController.getPaymentInfoList);
router.get('/:id', paymentController.getPayment);
router.get('/status/:transactionId', paymentController.checkStatus);
router.post('/:transactionId/refund', paymentController.refundPayment);

export default router;

