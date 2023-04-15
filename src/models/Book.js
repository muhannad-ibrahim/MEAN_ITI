/* eslint-disable func-names */
const mongoose = require('mongoose');
const mongoosePagination = require('mongoose-paginate-v2');

const bookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter a book title'],
            unique: [true, 'Book title already exists'],
        },
        categoryId: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please enter a category'],
        },
        AuthorId: {
            type: mongoose.Types.ObjectId,
            ref: 'Author',
            required: [true, 'Please enter an author'],
        },
        totalRate: {
            type: Number,
            default: 0,
        },
        ratingNumber: {
            type: Number,
            default: 0,
        },
        photo: {
            type: String,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        popularity: {
            type: Number,
            default: 0,
        },
        Interactions: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

bookSchema.methods.calculatePopularity = function () {
    if (this.totalRate !== undefined
        && this.ratingNumber !== undefined
        && this.Interactions !== undefined) {
        this.popularity = parseInt((this.totalRate / this.ratingNumber) * this.Interactions, 10);
    } else {
        console.log('Skipping book because one or more required properties are undefined');
    }
    return this.save();
};
bookSchema.pre('save', function (next) {
    this.calculatePopularity();
    next();
});

bookSchema.virtual('averageRating').get(function () {
    return this.totalRate / this.ratingNumber;
});

bookSchema.plugin(mongoosePagination);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
