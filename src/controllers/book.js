/* eslint-disable consistent-return */
/* eslint-disable no-undef */
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');

const getAllBooks = async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
        const pageSize = parseInt(req.query.pageSize, 10) || 6;
        const books = await Book
            .find()
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        const booksCount = await Book.countDocuments();
        res.json({ data: books, total: booksCount });
    } catch (error) {
        res.json(error.message);
    }
};

const createBook = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    const imageURL = `${req.protocol}://${req.headers.host}/bookImg/${req.file.filename}`;
    const book = await new Book({
        name: req.body.name,
        categoryId: req.body.categoryId,
        AuthorId: req.body.AuthorId,
        photo: imageURL,
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
        const book = await Book.findOneAndUpdate({ name: req.params.name }, { name });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'succes', cate });
    } catch (error) {
        res.json({ message: 'error', error });
    }
};

const deleteBookById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const book = await Book.findOne({ name: req.body.name }).exec();
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        await Book.findByIdAndRemove(req.params.id);
        res.send({ message: 'success' });
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
