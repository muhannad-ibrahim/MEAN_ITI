/* eslint-disable radix */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');
// const Category = require('../models/Category');
const asyncWrapper = require('../middleware');

const getAllBooks = async (req, res, next) => {
    const itemPerPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const promise = Book.paginate({}, { page: currentPage, limit: itemPerPage });
    const [err, books] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (books.docs.length === 0) {
        return res.status(404).json({ message: 'There are no books' });
    }

    return res.json({
        message: 'success',
        data: books.docs,
        pages: books.totalPages,
        currentPage: books.page,
        nextPage: books.hasNextPage ? books.nextPage : null,
        prevPage: books.hasPrevPage ? books.prevPage : null,
    });
};

const createBook = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const imageURL = `${req.protocol}://${req.headers.host}/bookImg/${req.file.filename}`;
    const book = new Book({
        name: req.body.name,
        categoryId: req.body.categoryId,
        AuthorId: req.body.AuthorId,
        photo: imageURL,
    });

    const promise = book.save();
    const [err, savedBook] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ message: 'success', savedBook });
};

const getBookById = async (req, res, next) => {
    const promise = Book.findById(req.params.id);
    const [err, book] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ message: 'success', book });
};

const updateBookById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const { body: { name } } = req;
    const promise = Book.findOneAndUpdate(req.params.id, { name });
    const [err, book] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!book) {
        return next({ message: 'Book not found' });
    }

    return res.json({ message: 'success', book });
};

const deleteBookById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const promise = Book.findByIdAndRemove(req.params.id);
    const [err, book] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!book) {
        return next({ message: 'Book not found' });
    }

    const filename = book.photo.split('/').pop();
    const path = './images/bookImg/';
    if (fs.existsSync(path + filename)) {
        console.log('file exists');
        fs.unlinkSync(path + filename);
    } else {
        console.log('file not found!');
    }

    return res.json({ message: 'success', book });
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBookById,
    deleteBookById,
};
