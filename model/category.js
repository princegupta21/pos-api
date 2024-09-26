// models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;
