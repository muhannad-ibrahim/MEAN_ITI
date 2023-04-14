/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const reviewSchemma = new mongoose.Schema({
    bookId: {
        type: mongoose.Types.ObjectId,
        ref: 'Book',
    },
    comment: {
        type: String,
        required: true,

    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    shelve: {
        type: String,
        enum: ['want to read', 'read', 'current read'],
        default: 'want to read',
    },
});

const userBookSchema = new mongoose.Schema({

    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    books: [reviewSchemma],

});

userBookSchema.plugin(mongoosePagination);

const UserBook = mongoose.model('UserBook', userBookSchema);
module.exports = UserBook;
