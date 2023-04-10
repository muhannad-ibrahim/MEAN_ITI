const mongoose = require('mongoose');

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
    shelve: {
        type: String,
        enum: ['Read', 'Reading', 'Want to read'],
        default: 'Want to read',
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

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
