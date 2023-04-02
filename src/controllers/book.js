/* eslint-disable no-undef */
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');

const getAllBooks = async (req, res) => {
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 6;
    try {
        const books = await Book
            .find()
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        res.json(books);
    } catch (error) {
        res.json(error);
    }
};

const createBook = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    const book = await new Book({
        name: req.body.name,
        categoryId: req.body.categoryId,
        AuthorId: req.body.AuthorId,
        photo: req.file.filename,
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

const updateBookById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const { body: { name } } = req;
        const book = await Book.findByIdAndUpdate(req.params.id, { name });
        res.json({ message: 'success', book });
    } catch (error) {
        res.json(error.message);
    }
};

const deleteBookById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const book = await Book.findByIdAndRemove(req.params.id);
        res.send({ message: 'success', book });
    } catch (error) {
        res.json(error.message);
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBookById,
    deleteBookById,
};
