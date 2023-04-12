/* eslint-disable consistent-return */
/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const UserBook = require('../models/userBooks');

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

const getUserBooks = async (req, res, next) => {
    const currentPage = parseInt(req.query.page) || 1;
    const itemPerPage = 5;
    const token = req.cookies.jwt;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next({ message: 'Unauthenticated' });
    }

    const promise = UserBook
        .find({ UserId: decodedToken.id })
        .populate({
            path: 'bookId',
            select: 'name AuthorId photo rating',
            populate: {
                path: 'AuthorId',
                select: 'firstName',
            },
        })
        .skip((currentPage - 1) * itemPerPage)
        .limit(itemPerPage)
        .exec();

    const [err, userBooks] = await asyncWrapper(promise);
    if (err) {
        return next(err);
    }

    const countPromise = UserBook.countDocuments({ UserId: decodedToken.id }).exec();
    const [countErr, count] = await asyncWrapper(countPromise);
    if (countErr) {
        return next(countErr);
    }

    const pages = Math.ceil(count / itemPerPage);
    const nextPage = currentPage < pages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    return res.json({
        message: 'success',
        data: userBooks,
        pages,
        currentPage,
        nextPage,
        prevPage,
    });
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

module.exports = {
    create,
    getUserBooks,
    addBookToUser,
};
