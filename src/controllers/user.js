/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { query } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'test';

const signup = async (req, res, next) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
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
    try {
        const users = await User.find().exec();
        res.json(users);
    } catch (error) {
        res.json(error);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.json(error.message);
    }
};

const updateUserById = async (req, res) => {
    try {
        const { body: { firstName, lastName, email } } = req;
        const user = await User.findByIdAndUpdate(req.params.id, { firstName, lastName, email });
        res.json(user);
    } catch (error) {
        res.json(error.message);
    }
};

const deleteUserById = async (req, res) => {
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
        res.json({ message: 'UNAuthenticated to login' });
    }
    const token = jwt.sign({ email, id: user.id }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ message: 'success', token });
};

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    login,
};
