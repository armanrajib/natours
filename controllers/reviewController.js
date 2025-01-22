import Review from '../models/reviewModel.js';
import catchAsync from '../utils/catchAsync.js';
import { createOne, getOne, updateOne, deleteOne } from './handlerFactory.js';

// CONTROLLERS
// ============

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// SET [TOUR ID] IN THE BODY FOR [SPECIFIC TOUR] AND [AND USER ID] FOR [AUTHENTICATED USER]
const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

const createReview = createOne(Review);

const getReview = getOne(Review);

const updateReview = updateOne(Review);

const deleteReview = deleteOne(Review);

export {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};
