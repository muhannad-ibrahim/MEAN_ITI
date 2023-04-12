/* eslint-disable consistent-return */
/* eslint-disable radix */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const UserBook = require('../models/userBooks');

const create = (req, res) => {
    console.log('mmmmmmmmmm');
    const userBook = new UserBook({
        UserId: '642624b835bf073262dc5d9b',
        // UserId: 1,
        bookId: '642624ba35bf073262dc5da4',
        // bookId: 21,
        reviews: [
            { reviewerName: 'user1', comment: 'Great book!', rate: 5 },
            { reviewerName: 'user2', comment: 'I enjoyed it.', rate: 4 },
        ],
    });
    userBook.save()
        .then(() => {
            console.log('ssssss');
            res.json({ message: 'success' });
        })
        .catch((error) => {
            console.log('ffffff');
            res.json({ message: error.message });
        });
};

const getUserBooks = async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const itemPerPage = 5;
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

const addBookToUser = async (req, res) => {
    try {
        // Get the book ID from the URL parameter
        const bookId = req.params.id;

        // Get the JWT from the cookies and decode it to get the user ID
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database
        const user = await User.findById(decodedToken.id);

        // Add the book to the user's array of books
        user.books.push({ bookId });
        // Save the user's changes
        await user.save();
        res.status(200).json({ message: 'Book added to user successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding book to user' });
    }
};

module.exports = {
    create,
    getUserBooks,
    addBookToUser,
};
