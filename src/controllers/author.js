const Author = require('../models/Author');
const checkRole = require('../middleware/checkRole');

const getAllAuthors = async (req, res) => {
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 6;
    try {
        const authors = await Author
            .find()
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        res.json(authors);
    } catch (error) {
        res.json(error);
    }
};

const createAuthor = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
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
    if (!checkRole.isAdmin(req)) {
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
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    try {
        const author = await Author.findById(req.params.id);
        author.remove().then((removedAuthor) => {
            res.json({ message: 'success', removedAuthor });
        }).catch((error) => {
            res.json({ message: error.message });
        });
    } catch (error) {
        res.json(error.message);
    }
};

module.exports = {
    getAllAuthors,
    createAuthor,
    getAuthorById,
    updateAuthorById,
    deleteAuthorById,
};
