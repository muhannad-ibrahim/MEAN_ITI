/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { query } = require('express');
const User = require('../models/User');

const create = (req, res, next) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    });
    if (user.save()) {
        res.json(user);
    } else {
        res.json(error.message);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().exec();
        res.json(users);
    } catch (error) {
        res.json(error);
    }
};

module.exports = {
    create,
    getAllUsers,
    getUserById,
    updateUserById,
};
