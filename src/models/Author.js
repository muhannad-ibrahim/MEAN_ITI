/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');
const Book = require('./Book');

const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        required: [true, 'Please enter a first name'],
    },
    lastName: {
        type: String,
        minLength: 3,
        required: [true, 'Please enter a last name'],
    },
    photo: {
        type: String,
    },
    dob: {
        type: Date,
    },
    bio: {
        type: String,
        maxLength: 300,
        minLength: 20,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

authorSchema.virtual('authorPopularity').get(async function () {
    const books = Book.find({ AuthorId: this._id });
    const popularityScores = (await books).map((book) => book.popularity);
    const totalPopularity = popularityScores.reduce((a, b) => a + b, 0);
    return totalPopularity / popularityScores.length;
});

authorSchema.plugin(mongoosePagination);

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
