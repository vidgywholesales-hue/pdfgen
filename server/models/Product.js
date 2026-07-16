const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'IN STOCK', // Can be 'OUT OF STOCK'
  },
  image: {
    type: String, // We'll store a Base64 string or an external URL
    required: true,
  }
}, {
  timestamps: true,
  // ensure virtuals are included if we map _id to id in JSON
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Product', productSchema);
