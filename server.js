import mongoose from 'mongoose';
import dotenv from 'dotenv';

import app from './app.js';

dotenv.config({ path: './config.env' });

// console.log(process.env);
// console.log(app.get('env'));

// DATABASE CONNECTION
// ====================

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// 4) START SERVER
// ================

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
