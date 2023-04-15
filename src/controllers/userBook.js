/* eslint-disable brace-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable no-const-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-empty */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const UserBook = require('../models/userBooks');
const asyncWrapper = require('../middleware');
const Book = require('../models/Book');
const User = require('../models/User');

const { JWT_SECRET } = process.env;

// const create = async (req, res, next) => {
//     const bookId = req.query.id;

//     const userPromise = User.findById(userId).exec();
//     const [userErr, user] = await asyncWrapper(userPromise);
//     if (userErr) {
//         return next(userErr);
//     }

//     if (!user) {
//         return res.status(404).send({ message: 'User not found' });
//     }

//     const bookPromise = Book.findById(bookId).exec();
//     const [bookErr, book] = await asyncWrapper(bookPromise);
//     if (bookErr) {
//         return next(bookErr);
//     }

//     if (!book) {
//         return res.status(404).send({ message: 'Book not found' });
//     }
//     const savePromise = userBook.save();
//     const [saveErr] = await asyncWrapper(savePromise);
//     if (saveErr) {
//         return next(saveErr);
//     }

//     return res.json({ message: 'success' });
// };

const getUserBooks = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.json({ message: 'Error token not found' });
    }
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await asyncWrapper(UserBook.find({ userId: decodedToken.id }));
        const booksCount = user[1][0].books.length;

        if ((booksCount % pageSize) === 0) {
            const totalPage = booksCount / pageSize;
            totalPages = parseInt(totalPage, 10);
        } else {
            const totalPage = booksCount / pageSize;
            totalPages = parseInt(totalPage, 10) + 1;
        }
        const usersBooks = await UserBook
            .find({ userId: decodedToken.id })
            .populate({
                path: 'books.bookId',
                select: 'name AuthorId photo rating',
                populate: {
                    path: 'AuthorId',
                    select: 'firstName lastName',
                },
            })
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        return res.json({ message: 'success', data: usersBooks, pages: totalPages });
    } catch (error) {
        res.json(error.message);
    }
};

const updatePushBook = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.json({ message: 'Error token not found' });
    }
    const payLoad = jwt.verify(token, process.env.JWT_SECRET);
    const idBook = req.params.id;
    const rateBook = req.body.rate;
    const shelveBook = req.body.shelve;
    const commentBook = req.body.comment;
    let previousRate = 0;

    const isExist = await Book.findById(idBook);
    if (!isExist) {
        return res.json({ message: 'Error Book not found' });
    }
    const addBook = await UserBook.findOneAndUpdate(
        { userId: payLoad.id, 'books.bookId': { $ne: idBook } },
        {
            $push: {
                books: {
                    bookId: idBook,
                    comment: commentBook,
                    rate: rateBook,
                    shelve: shelveBook,
                },
            },
        },
        {
            new: true,
        },
    ).select({ books: { $elemMatch: { bookId: idBook } } });
    if (!addBook) {
        const condition = {
            userId: payLoad.id,
            books: { $elemMatch: { bookId: idBook } },
        };
        const update = {
            $set: {
                'books.$.rate': rateBook,
                'books.$.shelve': shelveBook,
                'books.$.comment': commentBook,
            },
        };
        const result = await UserBook.findOneAndUpdate(condition, update).select({ books: { $elemMatch: { bookId: idBook } } });
        if (result) {
            previousRate = result.books[0].rate;
            console.log(previousRate);
        }
    }

    if (rateBook) {
        updateAvgRate(idBook, rateBook, previousRate);
    }

    if (addBook) {
        return res.json(addBook);
    }
    result = await UserBook.findOne(
        { userId: payLoad.id },
        { books: { $elemMatch: { bookId: idBook } } },
    );
    return res.json(result);
};

const updateAvgRate = async (idBook, rateBook, previousRate) => {
    const reqBook = await Book.findById(idBook);
    if (previousRate) {
        reqBook.totalRate = (reqBook.totalRate - previousRate) + Number(rateBook);
    } else {
        reqBook.ratingNumber++;
        reqBook.totalRate += Number(rateBook);
    }
    reqBook.save();
};

const deleteBook = async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.json({ message: 'Error token not found' });
    }
    const idBook = req.params.id;
    const payLoad = jwt.verify(token, process.env.JWT_SECRET);
    const prevBook = await UserBook.findOne({ userId: payLoad.id }).select({ books: { $elemMatch: { bookId: idBook } } });
    const deletedBook = await UserBook.findOneAndUpdate(
        { userId: payLoad.id, 'books.bookId': idBook },
        { $pull: { books: { bookId: idBook } } },
    );
    if (!prevBook.books[0].rate) {
        return deletedBook;
    }

    const book = await Book.findById(idBook);
    book.totalRate -= prevBook.books[0].rate;
    book.ratingNumber--;
    await book.save();
    return res.json(prevBook);
};

const getUserBooksByShelve = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.json({ message: 'Error token not found' });
    }
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    try {
        const payLoad = jwt.verify(token, process.env.JWT_SECRET);
        const user = await asyncWrapper(UserBook.find({ userId: payLoad.id }));
        const booksCount = user[1][0].books.length;
        if ((booksCount % pageSize) === 0) {
            const totalPage = booksCount / pageSize;
            totalPages = parseInt(totalPage, 10);
        } else {
            const totalPage = booksCount / pageSize;
            totalPages = parseInt(totalPage, 10) + 1;
        }
        const shelvedBooks = await UserBook
            .find({ userId: payLoad.id, 'books.shelve': req.params.shelve })
            .populate({
                path: 'books.bookId',
                select: 'name AuthorId photo rating',
                populate: {
                    path: 'AuthorId',
                    select: 'firstName lastName',
                },
            })
            .select({ books: { $elemMatch: { shelve: req.params.shelve } }, _id: 0 })
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        // }
        return res.json({ message: 'success', data: shelvedBooks, pages: totalPages });
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

module.exports = {
    // create,
    getUserBooks,
    // addBookToUser,
    updatePushBook,
    deleteBook,
    getUserBooksByShelve,
};
