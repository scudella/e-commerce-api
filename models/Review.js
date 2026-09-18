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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {timestamps: true},
);

ReviewSchema.index({product: 1, user: 1}, {unique: true});

// Static method to recalculate product rating stats
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {$match: {product: productId}},
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

  try {
    // ✅ Use explicit query filter { _id: productId } or findByIdAndUpdate
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
    });
  } catch (error) {
    console.log('Error updating average rating:', error);
  }
};

ReviewSchema.post(
  'deleteOne',
  {document: true, query: false},
  async function () {
    await this.constructor.calculateAverageRating(this.product);
  },
);

module.exports = mongoose.model('Review', ReviewSchema);
