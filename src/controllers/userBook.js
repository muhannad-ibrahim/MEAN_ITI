/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const UserBook = require('../models/userBooks');

const create = (req, res) => {
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
        .then(() => res.json({ message: 'success' }))
        .catch((error) => res.json({ message: error.message }));
};

const getAlluserBooks = async (req, res) => {
    const userBooks = await UserBook.find();
    return res.json(userBooks);
};

module.exports = {
    create,
    getAlluserBooks,
};
