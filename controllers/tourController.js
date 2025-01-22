import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { deleteOne } from './handlerFactory.js';

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

const getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.requestTime);
  console.log('req.query:', req.query);

  // BUILD QUERY THROUGH APIFeatures CLASS
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // EXECUTE QUERY
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findOne({ _id: req.params.id });
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour)
    return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

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

export {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
