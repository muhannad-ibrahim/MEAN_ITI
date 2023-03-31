/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { query } = require('express');
const User = require('../models/User');

const create = async (req, res, next) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    });
    // try {
    //     const result = await User.insertOne(user).exec();
    //     res.json(result);
    // } catch (error) {
    //     res.json({ message: error.message });
    // }
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

module.exports = {
    create,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
};
