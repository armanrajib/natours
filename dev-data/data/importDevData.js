import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import appRoot from 'app-root-path';

import Tour from '../../models/tourModel.js';
import User from '../../models/userModel.js';
import Review from '../../models/reviewModel.js';

// IMPORTING ENVIRONMENT VARIABLES
dotenv.config({ path: './config.env' });

// DATABASE CONNECTION
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${appRoot}/dev-data/data/tours.json`, 'utf-8'),
);

const users = JSON.parse(
  fs.readFileSync(`${appRoot}/dev-data/data/users.json`, 'utf-8'),
);

const reviews = JSON.parse(
  fs.readFileSync(`${appRoot}/dev-data/data/reviews.json`, 'utf-8'),
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

// HANDLE COMMAND LINE ARGUMENTS
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
