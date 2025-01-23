import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // This step has been implemented in the [views] folder in the [overview.pug] file

  // 3) Render that template using tour data from (step 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // .populate({ path: 'guides', fields: 'name photo' }); // This is not needed because the guides are already populated in the [tourModel.js] file

  // 2) Build the template
  // This step has been implemented in the [views] folder in the [tour.pug] file

  // 3) Render the template using the data from (step 1)
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

export { getOverview, getTour, getLoginForm };
