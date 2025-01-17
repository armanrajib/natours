import fs from 'fs';
import appRoot from 'app-root-path';

import Tour from '../models/tourModel.js';

const tours = JSON.parse(
  fs.readFileSync(`${appRoot}/dev-data/data/tours-simple.json`),
);

// CONTROLLER FOR PARAM MIDDLEWARE
// --------------------------------

// const checkTourId = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   const tourId = Number(val);
//   const tour = tours.find((el) => el.id === tourId);

//   if (!tour)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });

//   next();
// };

// CONTROLLERS
// ============

const getAllTours = async (req, res) => {
  try {
    console.log(req.requestTime);

    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

const getTour = async (req, res) => {
  try {
    // const tour = await Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

const updateTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  const updatedTour = { ...tour, ...req.body };
  const updatedTours = tours.map((el) => (el.id === id ? updatedTour : el));

  fs.writeFile(
    `${appRoot}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: updatedTour,
        },
      });
    },
  );
};

const deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const updatedTours = tours.filter((el) => el.id !== id);

  fs.writeFile(
    `${appRoot}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );
};

// OTHER CONTROLLERS
// ------------------

// const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }

//   next();
// };

export {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  // checkTourId,
  // checkBody,
};
