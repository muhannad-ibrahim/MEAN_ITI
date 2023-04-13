/* eslint-disable radix */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const Author = require('../models/Author');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');
const asyncWrapper = require('../middleware');

const getAllAuthors = async (req, res, next) => {
    const [error, authors] = await asyncWrapper(Author.find({}));
    if (error) {
        return next(error);
    }
    if (authors.length === 0) {
        return res.status(404).json({ message: 'There are no authors' });
    }
    return res.json({ message: 'success', data: authors });
};

const getAuthorsPagination = async (req, res, next) => {
    const authorperPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const [error, authors] = await asyncWrapper(Author.paginate({}, { page: currentPage, limit: authorperPage }));
    if (error) {
        return next(error);
    }
    if (authors.docs.length === 0) {
        return res.status(404).json({ message: 'There are no authors' });
    }
    return res.json({
        message: 'success',
        data: authors.docs,
        pages: authors.totalPages,
        currentPage: authors.page,
        nextPage: authors.hasNextPage ? authors.nextPage : null,
        prevPage: authors.hasPrevPage ? authors.prevPage : null,
    });
};

const createAuthor = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const imageURL = `${req.protocol}://${req.headers.host}/${req.file.filename}`;
    const authorData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        photo: imageURL,
        dob: req.body.dob,
        bio: req.body.bio,
    };
    const [error, savedAuthor] = await asyncWrapper(new Author(authorData).save());
    if (error) {
        return next(error);
    }
    return res.json({ message: 'success', data: savedAuthor });
};

const getAuthorById = async (req, res, next) => {
    const [error, author] = await asyncWrapper(Author.findById(req.params.id));
    if (error) {
        return next(error);
    }
    return res.json({ message: 'success', data: author });
};

const getAllAuthorsBooks = async (req, res, next) => {
    const authorId = req.params.AuthorId;
    const [error, books] = await asyncWrapper(Book.find({ AuthorId: authorId }));
    if (error) {
        return next(error);
    }
    return res.json({ data: books });
};

const updateAuthorById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const author = await Author.findById(req.params.id);
    author.firstName = req.body.firstName || author.firstName;
    author.lastName = req.body.lastName || author.lastName;
    author.photo = req.file.photo || author.photo;
    author.dob = req.body.dob || author.dob;
    author.bio = req.body.bio || author.bio;

    const promise = author.save();
    const [err, savedAuthor] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ message: 'success', savedAuthor });
};

const deleteAuthorById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const [error, author] = await asyncWrapper(Author.findByIdAndRemove(req.params.id));
    if (error) {
        return next(error);
    }
    const filename = author.photo.split('/').pop();
    const path = './images/';
    if (fs.existsSync(path + filename)) {
        console.log('file exists');
        fs.unlinkSync(path + filename);
    } else {
        console.log('file not found!');
    }
    return res.json({ message: 'success', data: author });
};

module.exports = {
    getAllAuthors,
    createAuthor,
    getAuthorById,
    updateAuthorById,
    deleteAuthorById,
    getAuthorsPagination,
    getAllAuthorsBooks,
};
