const mongoose = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a category name'],
        unique: [true, 'Category name already exists'],
    },
}, {
    timestamps: true,
});

categorySchema.plugin(mongoosePagination);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
