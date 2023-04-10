/* eslint-disable radix */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const Author = require('../models/Author');
const checkRole = require('../middleware/checkRole');

const getAllAuthors = async (req, res) => {
    try {
        const authorperPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const authors = await Author.paginate({}, { page: currentPage, limit: authorperPage });
        if (authors.docs.length === 0) {
            return res.status(404).json({ message: 'there is no authors' });
        }
        res.json({
            message: 'success',
            data: authors.docs,
            pages: authors.totalPages,
            currentPage: authors.page,
            nextPage: authors.hasNextPage ? authors.nextPage : null,
            prevPage: authors.hasPrevPage ? authors.prevPage : null,

        });
    } catch (error) {
        res.json(error.message);
    }
};

const createAuthor = async (req, res) => {
    if (!checkRole.isAdmin(req, res)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    const imageURL = `${req.protocol}://${req.headers.host}/${req.file.filename}`;
    const author = await new Author({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        photo: imageURL,
        dob: req.body.dob,
    });
    author.save().then((savedAuthor) => {
        res.json({ message: 'success', savedAuthor });
    }).catch((error) => {
        res.json({ message: error.message });
    });
};

const getAuthorById = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.json({ message: 'success', author });
    } catch (error) {
        res.json(error.message);
    }
};

const updateAuthorById = async (req, res) => {
    if (!checkRole.isAdmin(req, res)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    try {
        const author = await Author.findById(req.params.id);
        author.firstName = req.body.firstName;
        author.lastName = req.body.lastName;
        author.photo = req.body.photo;
        author.dob = req.body.dob;
        author.save().then((savedAuthor) => {
            res.json({ message: 'success', savedAuthor });
        }).catch((error) => {
            res.json({ message: error.message });
        });
    } catch (error) {
        res.json(error.message);
    }
};

const deleteAuthorById = async (req, res) => {
    if (!checkRole.isAdmin(req, res)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    const author = await Author.findByIdAndRemove(req.params.id);
    if (!author) {
        res.json({ message: 'error', error: 'Author not found' });
    } else {
        const filename = author.photo.split('/').pop();
        const path = './images/';
        if (fs.existsSync(path + filename)) {
            console.log('file exists');
            fs.unlinkSync(path + filename);
        } else {
            console.log('file not found!');
        }
        res.json({ message: 'success', author });
    }
};

module.exports = {
    getAllAuthors,
    createAuthor,
    getAuthorById,
    updateAuthorById,
    deleteAuthorById,
};
