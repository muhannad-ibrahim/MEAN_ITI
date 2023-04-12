/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable radix */
/* eslint-disable consistent-return */
// eslint-disable-next-line no-unused-vars
const { query } = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const checkRole = require('../middleware/checkRole');

const JWT_SECRET = process.env.JWT_SECRET || 'test';

const signup = async (req, res) => {
    const imageURL = `${req.protocol}://${req.headers.host}/${req.file.filename}`;
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        photo: imageURL,
    });
    user.save()
        .then(() => res.json({ message: 'success' }))
        .catch((error) => res.json({ message: error.message }));
};

const getAllUsers = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const itemPerPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    try {
        const users = await User.paginate({}, { page: currentPage, limit: itemPerPage });
        if (users.docs.length === 0) {
            return res.status(404).json({ message: 'there is no users' });
        }
        res.json({
            message: 'success',
            data: users.docs,
            pages: users.totalPages,
            currentPage: users.page,
            nextPage: users.hasNextPage ? users.nextPage : null,
            prevPage: users.hasPrevPage ? users.prevPage : null,

        });
    } catch (error) {
        return res.json(error.message);
    }
};

const getUserById = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    try {
        const user = await User.findById(req.params.id);
        return res.json(user);
    } catch (error) {
        return res.json(error.message);
    }
};

const updateUserById = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    try {
        const {
            body: {
                firstName, lastName, email, role,
            },
        } = req;
        const user = await User.findByIdAndUpdate(req.params.id, {
            firstName, lastName, email, role,
        });
        return res.json(user);
    } catch (error) {
        return res.json(error.message);
    }
};

const deleteUserById = async (req, res) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
        return res.json({ message: 'error', error: 'Author not found' });
    }
    const filename = user.photo.split('/').pop();
    const path = './images/';
    if (fs.existsSync(path + filename)) {
        console.log('file exists');
        fs.unlinkSync(path + filename);
    } else {
        console.log('file not found!');
    }
    return res.json({ message: 'success', user });
};

const login = async (req, res) => {
    const { body: { email, password } } = req;
    const user = await User.findOne({ email }).exec();
    if (!user) {
        return res.json({ message: 'error', error: 'User not found' });
    }
    const valid = user.verifyPassword(password);
    if (!valid) {
        return res.json({ message: 'error', error: 'UNAUTHENTICATED to login' });
    }
    const token = jwt.sign({ email, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 });

    return res.json({ message: 'success' });
};

const getUserProfile = async (req, res) => {
    try {
        const cookie = req.cookies.jwt;

        const payload = jwt.verify(cookie, JWT_SECRET);

        if (!payload) {
            return res.status(401).send({
                message: 'unauthenticated',
            });
        }

        const user = await User.findOne({ email: payload.email });

        const { _id, ...data } = await user.toJSON();

        return res.send(data);
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated',
        });
    }
};

const logout = async (req, res) => res.clearCookie('jwt');

const displayLogoutMessage = async (req, res) => res.send('logout successfully');

const getUserBooks = async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
        const pageSize = parseInt(req.query.pageSize, 10) || 6;
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const users = await User
            .findById(decodedToken.id)
            .populate({
                path: 'books.bookId',
                select: 'name AuthorId photo rating',
                populate: {
                    path: 'AuthorId',
                    select: 'firstName',
                },
            })
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        const usersCount = await User.countDocuments();
        return res.json({ data: users, total: usersCount });
    } catch (error) {
        return res.json(error.message);
    }
};

const addBookToUser = async (req, res) => {
    try {
        // Get the book ID from the URL parameter
        const bookId = req.params.id;

        // Get the JWT from the cookies and decode it to get the user ID
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database
        const user = await User.findById(decodedToken.id);

        // Add the book to the user's array of books
        user.books.push({ bookId });
        // Save the user's changes
        await user.save();
        return res.status(200).json({ message: 'Book added to user successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding book to user' });
    }
};

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserProfile,
    login,
    logout,
    displayLogoutMessage,
    getUserBooks,
    addBookToUser,
};
