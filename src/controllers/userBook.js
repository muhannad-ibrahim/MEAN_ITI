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
            { reviewerName: 'user3', comment: 'A classic.', rate: 5 },
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

module.exports = {
    create,
};
