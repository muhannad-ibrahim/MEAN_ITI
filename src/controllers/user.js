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
        .then(() => {
            res.json({ message: 'success' });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
};

const getAllUsers = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
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
        res.json(error.message);
    }
};

const getUserById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.json(error.message);
    }
};

const updateUserById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
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
        res.json(user);
    } catch (error) {
        res.json(error.message);
    }
};

const deleteUserById = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
        res.json({ message: 'error', error: 'Author not found' });
    } else {
        const filename = user.photo.split('/').pop();
        const path = './images/';
        if (fs.existsSync(path + filename)) {
            console.log('file exists');
            fs.unlinkSync(path + filename);
        } else {
            console.log('file not found!');
        }
        res.json({ message: 'success', user });
    }
};

const login = async (req, res) => {
    const { body: { email, password } } = req;
    const user = await User.findOne({ email }).exec();
    if (!user) {
        res.json({ message: 'error', error: 'User not found' });
    }
    const valid = user.verifyPassword(password);
    if (!valid) {
        res.json({ message: 'error', error: 'UNAUTHENTICATED to login' });
    }
    const token = jwt.sign({ email, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 });

    res.json({ message: 'success' });
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

        const { password, ...data } = await user.toJSON();

        return res.send(data);
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated',
        });
    }
};

const logout = async (req, res) => {
    res.clearCookie('jwt');
};

const displayLogoutMessage = async (req, res) => {
    res.send('logout successfully');
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
};
