import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: 'String',
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: 'String',
  password: {
    type: 'String',
    required: [true, 'Please provide a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: 'String',
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

// DOCUMENT MIDDLEWARE
// ====================

userSchema.pre('save', async function (next) {
  // If the password is not modified, then move on to the next middleware
  if (!this.isModified('password')) return next();

  // Hash the password with bcrypt (cost of 12)
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field
  this.passwordConfirm = undefined; // We don't want to persist the passwordConfirm to the database

  next();
});

const User = mongoose.model('User', userSchema);

export default User;
