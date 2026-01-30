const mongoose = require('mongoose');
const { CAR_STATUS } = require('../config/constants');

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a car title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide car brand'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide car model'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide year of manufacture'],
      min: [1900, 'Year must be valid'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in future'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },
    mileage: {
      type: Number,
      required: [true, 'Please provide mileage'],
      min: [0, 'Mileage cannot be negative'],
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CAR_STATUS),
      default: CAR_STATUS.AVAILABLE,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [
      {
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    features: [String],
    location: {
      city: String,
      state: String,
      country: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        username: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for search
carSchema.index({ title: 'text', description: 'text', brand: 'text', model: 'text' });
carSchema.index({ owner: 1 });
carSchema.index({ status: 1 });
carSchema.index({ createdAt: -1 });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
