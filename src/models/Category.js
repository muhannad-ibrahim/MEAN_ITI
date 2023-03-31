const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a category name'],
        unique: [true, 'Category name already exists'],
    },
}, {
    timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
