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
    },
    AuthorId: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
    },
    photo: {
        type: String,
    },
}, {
    timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
