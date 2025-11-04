    import axios, { AxiosInstance } from 'axios';
    import { sePayConfig, SePayResponse } from '../config/sepay';

    export class SePayService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
        baseURL: sePayConfig.apiUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sePayConfig.apiKey}`
        },
        timeout: 30000
        });
    }

    /**
     * Xử lý thanh toán
     */
    async processPayment(data: any): Promise<SePayResponse> {
        try {
        const response = await this.axiosInstance.post('/payment', data);
        return {
            success: true,
            data: response.data
        };
        } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
        }
    }

    /**
     * Lấy danh sách transactions từ Se Pay
     */
    async getTransactionsList(transaction_date_min?: string, transaction_date_max?: string): Promise<SePayResponse> {
        try {
        const response = await axios.get(`https://my.sepay.vn/userapi/transactions/list?transaction_date_min=${transaction_date_min}`, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sePayConfig.apiKey}`
            },
            timeout: 30000
        });
        return {
            success: true,
            data: response.data
        };
        } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
        }
    }

    /**
     * Kiểm tra trạng thái thanh toán
     */
    async checkPaymentStatus(transactionId: string): Promise<SePayResponse> {
        try {
        // Lấy danh sách transactions và tìm transaction cụ thể
        const result = await this.getTransactionsList();
        
        if (!result.success || !result.data) {
            return {
            success: false,
            error: 'Failed to get transactions list'
            };
        }

        // Tìm transaction trong danh sách
        const transactions = result.data.list || result.data.data || result.data.transactions || [];
        
        let transaction = null;
        
        if (Array.isArray(transactions)) {
            transaction = transactions.find((t: any) => {
            return t.id === transactionId || 
                    t.transactionId === transactionId ||
                    t.transaction_id === transactionId;
            });
        } else if (typeof transactions === 'object') {
            transaction = transactions[transactionId];
        }

        if (!transaction) {
            return {
            success: false,
            error: 'Transaction not found'
            };
        }

        return {
            success: true,
            data: {
            ...transaction,
            status: transaction.status || transaction.payment_status || 'unknown'
            }
        };
        } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to check payment status'
        };
        }
    }

    /**
     * Kiểm tra xem transaction ID có tồn tại trong danh sách không
     */
    async checkTransactionExists(transactionId: string, user: string): Promise<boolean> {
    try {
        // transaction_date_min = yesterday date format YYYY-MM-DD
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        // transaction_date_max = today date format YYYY-MM-DD
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];

        const result = await this.getTransactionsList(yesterdayDate, todayDate);
        
        if (!result.success || !result.data) {
            return false;
        }

        // Kiểm tra xem transaction ID có trong danh sách không
        const transactions = result.data.transactions || [];
        
        // Kiểm tra trong array hoặc object
        if (Array.isArray(transactions)) {
            return transactions.some((transaction: any) => {
            return transaction.transaction_content.includes(`${user} ${transactionId}`);
            });
        }
        return false;
        } catch (error) {
        console.error('Error checking transaction:', error);
        return false;
        }
    }

    /**
     * Hoàn tiền
     */
    async refundPayment(transactionId: string, amount?: number): Promise<SePayResponse> {
        try {
        const response = await this.axiosInstance.post(`/payment/${transactionId}/refund`, {
            amount
        });
        return {
            success: true,
            data: response.data
        };
        } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
        }
    }
    }

    export default new SePayService();

