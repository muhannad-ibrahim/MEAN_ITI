const mongoose = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a book title'],
        unique: [true, 'Book title already exists'],
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please enter a category'],
    },
    AuthorId: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        required: [true, 'Please enter an author'],
    },
    totalRate: {
        type: Number,
        default: 0,
    },
    raringNumber: {
        type: Number,
        default: 0,
    },
    photo: {
        type: String,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
}, {
    timestamps: true,
});

bookSchema.plugin(mongoosePagination);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
