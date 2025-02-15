import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';

// import User from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      trim: true,
      unique: true,
      minLength: [5, 'A tour name must have at least 5 characters'],
      maxLength: [40, 'A tour name must have at most 40 characters'],
      // validate: [validator.isAlpha, 'Tour name can only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // Only for strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666 => 46.66666 => 47 => 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' only points to current doc on NEW document creation, but NOT on document update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price', // {VALUE} => The value that the user provided
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // Array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // Latitude (North-South), Longitude (East-West)
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// INDEXES
// --------

// tourSchema.index({ price: 1 });
// tourSchema.index({ ratingsAverage: -1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); // Compound index
tourSchema.index({ slug: 1 });

// GEO-SPATIAL INDEX
// -----------------

tourSchema.index({ startLocation: '2dsphere' });

// Virtual properties can't be used in queries because they are not stored in the database
// Can't use arrow function here because we need 'this' keyword

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE
// -----------------

// Virtual populate is used to populate reviews in the tour model
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE
// --------------------

// Runs before .save() and .create() but not .insertMany(), .update(), .findByIdAndUpdate(), etc.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// CAN USE MULTIPLE PRE & POST MIDDLEWARES
tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

// EMBEDDING [guides] documents into the [tour] document
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE
// -----------------

// Runs before .find(), findOne(), findOneAndUpdate(), etc.
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// POPULATE [guides] DOCUMENTS INTO [tour] DOCUMENTS
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// -----------------------

// Runs before .aggregate() // Create clash with $geoNear
// tourSchema.pre('aggregate', function (next) {
//   console.log(this.pipeline(), '\n👀');
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // Adds a new stage at the beginning of the pipeline
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;

/*
There are 4 types of middleware in mongoose:
  1. Document middleware
  2. Query middleware 
  3. Aggregate middleware
  4. Model middleware
*/
