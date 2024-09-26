// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true},
  imageUrl: { type: String, required: false },
  imageHash: {type: String, required: false},
  sku: {type: String, required: true, unique: true},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
