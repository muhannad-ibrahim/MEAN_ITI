/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { query } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const checkRole = require('../middleware/checkRole');

const JWT_SECRET = process.env.JWT_SECRET || 'test';

const signup = async (req, res, next) => {
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
        .then((savedUser) => {
            res.json({ message: 'success', savedUser });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
};

const getAllUsers = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'You are not an admin' });
    }
    try {
        const users = await User.find().exec();
        res.json(users);
    } catch (error) {
        res.json(error);
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
    try {
        console.log('dd');
        const user = await User.findByIdAndRemove(req.params.id);
        res.send(user);
    } catch (error) {
        res.json(error.message);
    }
};

const login = async (req, res, next) => {
    const { body: { email, password } } = req;
    const user = await User.findOne({ email }).exec();
    const valid = user.verifyPassword(password);
    if (!valid) {
        res.json({ message: 'error', error: 'UNAUTHENTICATED to login' });
    }
    const token = jwt.sign({ email, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 4 });

    res.json({ message: 'success' });
};

const logout = async (req, res, next) => {
    res.clearCookie('cookie_name');
    res.redirect('/');
};

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    login,
    logout,
};
