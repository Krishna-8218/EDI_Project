import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { ApiResponse } from './utils/apiResponse';
import { config } from './config/env';

const app = express();

// Security Middlewares
app.use(helmet());

// CORS configuration supporting dynamic frontend origin and local dev ports
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const isAllowed =
        config.frontendUrls.includes(origin) ||
        /^http:\/\/localhost:(3000|5173|5174|8080|8000)$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:(3000|5173|5174|8080|8000)$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development to ensure zero CORS blocking
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request Parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', routes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
