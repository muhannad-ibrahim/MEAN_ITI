const Book = require('../models/Book');

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().exec();
        res.json(books);
    } catch (error) {
        res.json(error);
    }
};

const createBook = async (req, res) => {
    const book = await new Book({
        name: req.body.name,
        categoryId: req.body.categoryId,
        AuthorId: req.body.AuthorId,
    });
    book.save().then((savedBook) => {
        res.json({ message: 'success', savedBook });
    }).catch((error) => {
        res.json({ message: 'error', error });
    });
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.json({ message: 'success', book });
    } catch (error) {
        res.json(error.message);
    }
};
module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    // updateBookById,
    // deleteBookById,
};
