import express from 'express';

import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} from '../controllers/userController.js';
import {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:token').patch(resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.route('/updatemypassword').patch(updatePassword);

router.route('/me').get(getMe, getUser);
router.route('/updateme').patch(updateMe);
router.route('/deleteme').delete(deleteMe);

// Restrict all routes after this middleware to admin only
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
