/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const UserBook = require('../models/userBooks');
const Book = require('../models/Book');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'test';

const create = async (req, res, next) => {
    const userId = req.body.UserId;
    const { bookId } = req.body;

    const userPromise = User.findById(userId).exec();
    const [userErr, user] = await asyncWrapper(userPromise);
    if (userErr) {
        return next(userErr);
    }

    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    const bookPromise = Book.findById(bookId).exec();
    const [bookErr, book] = await asyncWrapper(bookPromise);
    if (bookErr) {
        return next(bookErr);
    }

    if (!book) {
        return res.status(404).send({ message: 'Book not found' });
    }

    const userBook = new UserBook({
        UserId: userId,
        bookId,
        reviews: [
            { reviewerName: 'user1', comment: 'Great book!', rate: 5 },
            { reviewerName: 'user2', comment: 'I enjoyed it.', rate: 4 },
        ],
    });

    const savePromise = userBook.save();
    const [saveErr] = await asyncWrapper(savePromise);
    if (saveErr) {
        return next(saveErr);
    }

    return res.json({ message: 'success' });
};

const getUserBooks = async (req, res) => {
    console.log('ddddd');
    const currentPage = parseInt(req.query.page) || 1;
    const itemPerPage = 5;
    const token = req.cookies.jwt;
    let decodedToken;
    try {
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const users = await UserBook.paginate({}, { page: currentPage, limit: itemPerPage })
            .findById(decodedToken.id)
            .populate({
                path: 'books.bookId',
                select: 'name AuthorId photo rating',
                populate: {
                    path: 'AuthorId',
                    select: 'firstName',
                },
            });
        return res.json({
            message: 'success',
            data: users.docs,
            pages: users.totalPages,
            currentPage: users.page,
            nextPage: users.hasNextPage ? users.nextPage : null,
            prevPage: users.hasPrevPage ? users.prevPage : null,
        });
    } catch (error) {
        res.json(error.message);
    }
};

const addBookToUser = async (req, res, next) => {
    const bookId = req.params.id;
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userPromise = User.findById(decodedToken.id);
    const [userErr, user] = await asyncWrapper(userPromise);
    if (userErr) {
        return next({ message: 'Error finding user' });
    }

    user.books.push({ bookId });
    const saveUserPromise = user.save();
    const [saveErr] = await asyncWrapper(saveUserPromise);
    if (saveErr) {
        return next({ message: 'Error saving user while adding book' });
    }

    res.status(200).json({ message: 'Book added to user successfully' });
};

const updatePushBook = (req, res) => {
    const token = req.cookies.jwt;
    const payLoad = jwt.verify(token, process.env.JWT_SECRET);
    const idBook = req.query.id;
    const rateBook = req.body.rate;
    const shelveBook = req.body.shelve;
    const commentBook = req.body.comment;
};

module.exports = {
    create,
    getUserBooks,
    addBookToUser,
    updatePushBook,
};
