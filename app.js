import express from 'express';
import morgan from 'morgan';
import appRoot from 'app-root-path';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

// UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = express();

// 1) MIDDLEWARES
// ===============

// ANOTHER MIDDLEWARE (SET SECURITY HTTP HEADERS) - HELMET
app.use(helmet());

// MIDDLEWARE 1
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ANOTHER MIDDLEWARE (RATE LIMITER)
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    error: 'Too many requests from this IP, please try again in an hour!',
  },
});

app.use('/api', limiter);

// MIDDLEWARE 2: It parses incoming requests with a JSON payload & attaches the resulting JavaScript object to the req.body
app.use(express.json({ limit: '10kb' })); // body more than 10kb will be rejected

// ANOTHER MIDDLEWARE (DATA SANITIZATION AGAINST NOSQL QUERY INJECTION) - MONGODB
app.use(mongoSanitize());

// ANOTHER MIDDLEWARE (DATA SANITIZATION AGAINST XSS) - MONGODB
app.use(xssClean());

// MIDDLEWARE 3
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// MIDDLEWARE 4
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Adding a new property to the request object
  next();
});

// MIDDLEWARE 5 : Serving static files
app.use(express.static(`${appRoot}/public`));

// 2) ROUTE HANDLERS
// ==================

// No route handlers here

// 3) ROUTES
// ==========

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// UNHANDLED ROUTES MIDDLEWARE
// ============================

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err); // Passing anything to next() will be treated as an error

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
// =================================

app.use(globalErrorHandler);

// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

export default app;
