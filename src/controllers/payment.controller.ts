import { Request, Response } from 'express';
import { SePayService } from '../services/sepay.service';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  private sePayService: SePayService;
  private paymentService: PaymentService;

  constructor() {
    this.sePayService = new SePayService();
    this.paymentService = new PaymentService();
  }

  /**
   * Tạo yêu cầu thanh toán mới
   */
  createPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { orderId, amount, currency, description, metadata } = req.body;

      // Validate input
      if (!orderId || !amount || !currency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, amount, currency'
        });
      }

      // Call Se Pay API
      const sePayResult = await this.sePayService.processPayment({
        orderId,
        amount,
        currency,
        description,
        metadata
      });

      if (!sePayResult.success) {
        return res.status(400).json({
          success: false,
          message: sePayResult.error || 'Payment processing failed'
        });
      }

      // Save to database
      const payment = await this.paymentService.createPayment({
        transactionId: sePayResult.data.transactionId,
        orderId,
        amount,
        currency,
        status: 'pending',
        description,
        metadata
      });

      return res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  /**
   * Lấy thông tin thanh toán theo ID
   */
  getPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const payment = await this.paymentService.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  /**
   * Kiểm tra trạng thái thanh toán
   */
  checkStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { transactionId } = req.params;

      // Check status from Se Pay API
      const sePayResult = await this.sePayService.checkPaymentStatus(transactionId);

      if (!sePayResult.success) {
        return res.status(400).json({
          success: false,
          message: sePayResult.error || 'Failed to check payment status'
        });
      }

      // Update database
      const payment = await this.paymentService.updatePaymentStatus(
        transactionId,
        sePayResult.data.status
      );

      return res.status(200).json({
        success: true,
        data: payment || sePayResult.data
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  /**
   * Kiểm tra trạng thái thanh toán theo ID
   */
  getPaymentStatusInfo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, user } = req.body;

      // Validate input - chỉ chấp nhận id trong payload
      if (!id || typeof id !== 'string' || !user || typeof user !== 'string' || id.length !== 12) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input'
        });
      }

      // Kiểm tra transaction ID có tồn tại trong Se Pay không
      const exists = await this.paymentService.checkTransactionExists(id, user);

      return res.status(200).json({
        success: exists
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false
      });
    }
  };

  /**
   * Lấy danh sách thông tin thanh toán
   */
  getPaymentInfoList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { transaction_date_min, transaction_date_max } = req.query;
      // Gọi Se Pay API để lấy danh sách transactions
      const sePayResult = await this.sePayService.getTransactionsList(transaction_date_min as string, transaction_date_max as string);

      if (!sePayResult.success) {
        return res.status(400).json({
          success: false,
          message: sePayResult.error || 'Failed to get payment info list'
        });
      }

      return res.status(200).json({
        success: true,
        data: sePayResult.data
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  /**
   * Hoàn tiền
   */
  refundPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { transactionId } = req.params;
      const { amount } = req.body;

      // Call Se Pay refund API
      const sePayResult = await this.sePayService.refundPayment(transactionId, amount);

      if (!sePayResult.success) {
        return res.status(400).json({
          success: false,
          message: sePayResult.error || 'Refund failed'
        });
      }

      // Update payment status
      const payment = await this.paymentService.updatePaymentStatus(
        transactionId,
        'refunded'
      );

      return res.status(200).json({
        success: true,
        data: payment || sePayResult.data
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };
}

