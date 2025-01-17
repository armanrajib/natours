import express from 'express';

import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  // checkTourId,
  // checkBody,
} from '../controllers/tourController.js';

const router = express.Router();

// PARAM MIDDLEWARE
// router.param('id', checkTourId);

router.route('/').get(getAllTours).post(createTour); // checkBody is removed from the POST route
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
