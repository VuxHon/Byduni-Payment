import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  // Load entities from dist/ in production, src/ in development
  entities: process.env.NODE_ENV === 'production' 
    ? ['dist/entities/**/*.js']
    : ['src/entities/**/*.ts'],
  // Load migrations from dist/ in production, src/ in development
  migrations: process.env.NODE_ENV === 'production'
    ? ['dist/migrations/**/*.js']
    : ['src/migrations/**/*.ts']
});

