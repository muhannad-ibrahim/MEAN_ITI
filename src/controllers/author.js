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

const getAllAuthors = async (req, res) => {
    try {
        const authors = await Author.find({});
        if (authors.length === 0) {
            return res.status(404).json({ message: 'there is no authors' });
        }
        return res.json({
            message: 'success',
            data: authors,
        });
    } catch (error) {
        return res.json(error.message);
    }
};
const getAuthorsPagination = async (req, res) => {
    try {
        const authorperPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const authors = await Author.paginate({}, { page: currentPage, limit: authorperPage });
        if (authors.docs.length === 0) {
            return res.status(404).json({ message: 'there is no authors' });
        }
        return res.json({
            message: 'success',
            data: authors.docs,
            pages: authors.totalPages,
            currentPage: authors.page,
            nextPage: authors.hasNextPage ? authors.nextPage : null,
            prevPage: authors.hasPrevPage ? authors.prevPage : null,

        });
    } catch (error) {
        return res.json(error.message);
    }
};

const createAuthor = async (req, res) => {
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
    try {
        const author = await Author.create(authorData);
        return res.status(201).json({ message: 'success', data: author });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAuthorById = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        return res.json({ message: 'success', author });
    } catch (error) {
        return res.json(error.message);
    }
};
const getAllAuthorsBooks = async (req, res) => {
    try {
        const books = await Book.find({ AuthorId: req.params.AuthorId }).exec();
        res.json({ data: books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAuthorById = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    try {
        const author = await Author.findById(req.params.id);
        author.firstName = req.body.firstName;
        author.lastName = req.body.lastName;
        author.photo = req.body.photo;
        author.dob = req.body.dob;
        author.bio = req.body.bio;
        author.save().then((savedAuthor) => {
            res.json({ message: 'success', savedAuthor });
        }).catch((error) => {
            res.json({ message: error.message });
        });
        author.save().then((savedAuthor) => res.json({ message: 'success', savedAuthor }))
            .catch((error) => res.json({ message: error.message }));
    } catch (error) {
        return res.json(error.message);
    }
};

const deleteAuthorById = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const author = await Author.findByIdAndRemove(req.params.id);
    if (!author) {
        return res.json({ message: 'error', error: 'Author not found' });
    }
    const filename = author.photo.split('/').pop();
    const path = './images/';
    if (fs.existsSync(path + filename)) {
        console.log('file exists');
        fs.unlinkSync(path + filename);
    } else {
        console.log('file not found!');
    }
    return res.json({ message: 'success', author });
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
