import express from 'express';
import morgan from 'morgan';
import appRoot from 'app-root-path';
import dotenv from 'dotenv';

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

dotenv.config({ path: './config.env' });

const app = express();

// 1) MIDDLEWARES
// ===============

// MIDDLEWARE 1
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MIDDLEWARE 2: It parses incoming requests with a JSON payload & attaches the resulting JavaScript object to the req.body
app.use(express.json());

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

export default app;
