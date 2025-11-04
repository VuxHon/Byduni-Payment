import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware để check Authorization header
 * Yêu cầu: Authorization: Bearer <API_KEY>
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = process.env.API_KEY;

  // Nếu không có API_KEY trong env, bỏ qua middleware
  if (!apiKey) {
    console.warn('API_KEY not configured in environment variables');
    return next();
  }

  // Lấy Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Authorization header is required'
    });
    return;
  }

  // Kiểm tra format: Bearer <token>
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      message: 'Invalid Authorization header format. Expected: Bearer <token>'
    });
    return;
  }

  const token = parts[1];

  // So sánh token với API_KEY trong env
  if (token !== apiKey) {
    res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
    return;
  }

  // Xác thực thành công, tiếp tục
  next();
};

