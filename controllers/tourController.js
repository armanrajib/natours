import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} from './handlerFactory.js';

// MIDDLEWARES
// ============

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// CONTROLLERS
// ============

const getAllTours = getAll(Tour);

const createTour = createOne(Tour);

const getTour = getOne(Tour, { path: 'reviews' });

const updateTour = updateOne(Tour);

const deleteTour = deleteOne(Tour);

// OTHER CONTROLLERS
// ==================

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Stage 1: FILTER
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    // Stage 2: GROUP
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    // Stage 3: SORT
    {
      $sort: { avgPrice: 1 }, // 1 for ascending, -1 for descending
    },

    // YOU CAN REPEAT STAGES IF YOU WANT
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    // Stage 1: UNWIND
    {
      $unwind: '$startDates',
    },

    // Stage 2: FILTER
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    // Stage 3: GROUP
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    // Stage 4: ADD FIELDS
    {
      // $addFields: { month: '$_id', year: year },

      // $addFields: {
      //   year: year,
      //   month: {
      //     $arrayElemAt: [
      //       [
      //         '',
      //         'January',
      //         'February',
      //         'March',
      //         'April',
      //         'May',
      //         'June',
      //         'July',
      //         'August',
      //         'September',
      //         'October',
      //         'November',
      //         'December',
      //       ],
      //       '$_id',
      //     ],
      //   },
      // },

      $addFields: {
        year: year,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'January' },
              { case: { $eq: ['$_id', 2] }, then: 'February' },
              { case: { $eq: ['$_id', 3] }, then: 'March' },
              { case: { $eq: ['$_id', 4] }, then: 'April' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'June' },
              { case: { $eq: ['$_id', 7] }, then: 'July' },
              { case: { $eq: ['$_id', 8] }, then: 'August' },
              { case: { $eq: ['$_id', 9] }, then: 'September' },
              { case: { $eq: ['$_id', 10] }, then: 'October' },
              { case: { $eq: ['$_id', 11] }, then: 'November' },
              { case: { $eq: ['$_id', 12] }, then: 'December' },
            ],
            default: 'Unknown month',
          },
        },
      },
    },

    // Stage 5: PROJECT
    {
      $project: { _id: 0 },
    },

    // Stage 6: SORT
    {
      $sort: { numTourStarts: -1 },
    },

    // Stage 7: LIMIT
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

// GEOSPATIAL
// ===========

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: {
        data: tours,
      },
    },
  });
});

// /distances/:latlng/unit/:unit
// /distances/34.111745,-118.113491/unit/mi

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    // Stage 1: $geoNear (must be the first stage)
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },

    // Stage 2: $project
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

export {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
};
