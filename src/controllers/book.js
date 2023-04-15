/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
const fs = require('fs');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');
// const Category = require('../models/Category');
const asyncWrapper = require('../middleware');

// const getAllBooks = async (req, res, next) => {
//     const itemPerPage = parseInt(req.query.limit) || 5;
//     const currentPage = parseInt(req.query.page) || 1;
//     const promise = Book.paginate({}, { page: currentPage, limit: itemPerPage });
//     const [err, books] = await asyncWrapper(promise);

//     if (err) {
//         return next(err);
//     }

//     if (books.docs.length === 0) {
//         return res.status(404).json({ message: 'There are no books' });
//     }

//     return res.json({
//         message: 'success',
//         data: books.docs,
//         pages: books.totalPages,
//         currentPage: books.page,
//         nextPage: books.hasNextPage ? books.nextPage : null,
//         prevPage: books.hasPrevPage ? books.prevPage : null,
//     });
// };

const getAllBooks = async (req, res, next) => {
    const booksCount = await asyncWrapper(Book.countDocuments().exec());
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    if ((booksCount % pageSize) === 0) {
        const totalPage = booksCount / pageSize;
        totalPages = parseInt(totalPage, 10);
    } else {
        const totalPage = booksCount / pageSize;
        totalPages = parseInt(totalPage, 10) + 1;
    }
    const [error, books] = await asyncWrapper(Book
        .find()
        .populate({
            path: 'AuthorId',
            select: 'firstName',
        })
        .populate({
            path: 'categoryId',
            select: 'name',
        })
        .skip((pageNumber) * pageSize)
        .limit(pageSize)
        .exec());

    if (error) {
        return next(error);
    }
    if (books.length === 0) {
        return res.status(404).json({ message: 'There are no books' });
    }
    return res.json({
        message: 'success',
        data: books,
        pages: totalPages,
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
    const [error, book] = await asyncWrapper(promise
        .populate({
            path: 'AuthorId',
            select: 'firstName lastName',
        })
        .populate({
            path: 'categoryId',
            select: 'name',
        }));
    if (error) {
        return next(error);
    }
    return res.json({ message: 'success', book });
};
const updateBookById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const book = await Book.findById(req.params.id);
    book.name = req.body.name;
    book.categoryId = req.body.categoryId;
    book.AuthorId = req.body.AuthorId;
    if (req.file) {
        const filename = book.photo.split('/').pop();
        const path = './images/bookImg/';
        console.log(filename);
        if (fs.existsSync(path + filename)) {
            console.log('file exists');
            fs.unlinkSync(path + filename);
        }
        const imageURL = `${req.protocol}://${req.headers.host}/bookImg/${req.file.filename}`;
        book.photo = imageURL;
    }
    const promise = book.save();
    const [err, savedBook] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ message: 'success', savedBook });
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
const popularBook = async (req, res) => {
    console.log('dddddd');
    try {
        const mostPopularBook = await Book.find({}).sort({ popularity: -1 }).limit(1);
        if (mostPopularBook.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }
        return res.json(mostPopularBook);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBookById,
    deleteBookById,
    popularBook,
};
