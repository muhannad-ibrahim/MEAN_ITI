/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const router = require('express').Router();

const Book = require('../models/Book');

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().exec();
        res.json(books);
    } catch (error) {
        res.json(error);
    }
};

module.exports = {
    getAllBooks,
    // getBookById,
    // updateBookById,
    // deleteBookById,
};
