/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
const fs = require('fs');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');
const asyncWrapper = require('../middleware');
const cloudinary = require('../utils/cloudinary');

const getAllBooks = async (req, res, next) => {
    const booksCount = await asyncWrapper(Book.countDocuments().exec());
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    if ((booksCount[1] % pageSize) === 0) {
        const totalPage = booksCount[1] / pageSize;
        totalPages = parseInt(totalPage, 10);
    } else {
        const totalPage = booksCount[1] / pageSize;
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
    // const isUserAdmin = await checkRole.isAdmin(req);
    // if (!isUserAdmin) {
    //     return res.status(401).json({ message: 'You are not an admin' });
    // }
    let imageURL = '';
    if (req.file) {
        try {
            imageURL = await cloudinary.uploader.upload(req.file.path);
        } catch (error) {
            return next(error);
        }
    }
    const book = new Book({
        name: req.body.name,
        categoryId: req.body.categoryId,
        AuthorId: req.body.AuthorId,
        photo: imageURL.secure_url,
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
        const imageURL = await cloudinary.uploader.upload(req.file.path);
        book.photo = imageURL.secure_url;
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
