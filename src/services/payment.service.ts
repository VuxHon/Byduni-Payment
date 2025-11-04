import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment } from '../entities/payment.entity';

export interface CreatePaymentDto {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  /**
   * Tạo thanh toán mới
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(data);
    return await this.paymentRepository.save(payment);
  }

  async checkTransactionExists(transactionId: string, user: string): Promise<boolean> {
    const query = `
    SELECT * FROM payment_transactions WHERE content like '%${user} ${transactionId}%'
    `;
    const result = await AppDataSource.query(query);
    console.log(result);
    return result.length > 0;
  }

  /**
   * Lấy thanh toán theo ID
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { id } });
  }

  /**
   * Lấy thanh toán theo transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { transactionId } });
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(
    transactionId: string,
    status: string
  ): Promise<Payment | null> {
    const payment = await this.getPaymentByTransactionId(transactionId);
    
    if (!payment) {
      return null;
    }

    payment.status = status;
    
    if (status === 'completed' || status === 'paid') {
      payment.paidAt = new Date();
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * Lấy tất cả thanh toán
   */
  async getAllPayments(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Payment[]; total: number }> {
    const [data, total] = await this.paymentRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { data, total };
  }
}

export default new PaymentService();

