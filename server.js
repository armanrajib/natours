import dotenv from 'dotenv';

import app from './app.js';

dotenv.config({ path: './config.env' });

// console.log(process.env);
// console.log(app.get('env'));

// 4) START SERVER
// ================

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
