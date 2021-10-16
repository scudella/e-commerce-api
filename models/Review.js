const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
      maxlength: [1000, 'Comment allow a maximum of 1000 characters'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// instead of methods, statics
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: {
          $avg: '$rating',
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  // console.log(result);
  try {
    await this.model('Product').findOneAndUpdate(productId, {
      averageRating: result[0]?.averageRating || 0,
      numOfReviews: result[0]?.numOfReviews || 0,
    }); //optional chaining. See js nuggets
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
