import dotenv from 'dotenv';

dotenv.config();

export const sePayConfig = {
  apiUrl: process.env.SE_PAY_API_URL,
  apiKey: process.env.SE_PAY_API_KEY,
};

export interface SePayResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

