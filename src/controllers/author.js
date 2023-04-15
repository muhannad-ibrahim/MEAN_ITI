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
const cloudinary = require('../utils/cloudinary');

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
    const authorsCount = await asyncWrapper(Author.find({}).count());
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    if ((authorsCount % pageSize) === 0) {
        const totalPage = authorsCount / pageSize;
        totalPages = parseInt(totalPage, 10);
    } else {
        const totalPage = authorsCount / pageSize;
        totalPages = parseInt(totalPage, 10) + 1;
    }
    const [error, authors] = await asyncWrapper(Author
        .find()
        .skip((pageNumber) * pageSize)
        .limit(pageSize)
        .exec());
    if (error) {
        return next(error);
    }
    if (authors.length === 0) {
        return res.status(404).json({ message: 'There are no authors' });
    }
    return res.json({
        message: 'success',
        data: authors,
        pages: totalPages,
    });
};

const createAuthor = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const authorData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: req.body.dob,
        bio: req.body.bio,
    };
    if (req.file) {
        try {
            const imageURL = await cloudinary.uploader.upload(req.file.path);
            authorData.photo = imageURL.secure_url;
        } catch (error) {
            return next(error);
        }
    }
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
    if (req.file) {
        try {
            const imageURL = await cloudinary.uploader.upload(req.file.path);
            author.photo = imageURL.secure_url;
        } catch (error) {
            return next(error);
        }
    }
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
    return res.json({ message: 'success', data: author });
};

const popularAuthor = async (req, res, next) => {
    try {
        const author = await Author.getAuthorsWithPopularity();
        res.status(200).json(author);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAuthors,
    createAuthor,
    getAuthorById,
    updateAuthorById,
    deleteAuthorById,
    getAuthorsPagination,
    getAllAuthorsBooks,
    popularAuthor,
};
