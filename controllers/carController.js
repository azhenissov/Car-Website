const Car = require('../models/Car');
const { HTTP_STATUS, ERROR_MESSAGES, CAR_STATUS, ROLES } = require('../config/constants');

// Create Car Listing
const createCarListing = async (req, res, next) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user.userId,
    };

    const car = new Car(carData);
    await car.save();
    await car.populate('owner', 'username email firstName lastName');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Car listing created successfully',
      car,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Car Listings
const getAllCarListings = async (req, res, next) => {
  try {
    const { status, brand, model, minPrice, maxPrice, page = 1, limit = 10, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const cars = await Car.find(filter)
      .populate('owner', 'username email firstName lastName phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Car.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      cars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Car Listing
const getCarListingById = async (req, res, next) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'username email firstName lastName phone address');

    if (!car) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CAR_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// Update Car Listing
const updateCarListing = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CAR_NOT_FOUND,
      });
    }

    // Check ownership
    if (car.owner.toString() !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own car listings',
      });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('owner', 'username email firstName lastName phone');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Car listing updated successfully',
      car: updatedCar,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Car Listing
const deleteCarListing = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CAR_NOT_FOUND,
      });
    }

    // Check ownership
    if (car.owner.toString() !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own car listings',
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Car listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get User's Car Listings
const getUserCarListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const cars = await Car.find({ owner: req.user.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Car.countDocuments({ owner: req.user.userId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      cars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCarListing,
  getAllCarListings,
  getCarListingById,
  updateCarListing,
  deleteCarListing,
  getUserCarListings,
};
