/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Category = require('../models/Category');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');

const getAllCategories = async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
        const pageSize = parseInt(req.query.pageSize, 10) || 6;
        const categories = await Category
            .find()
            .skip((pageNumber) * pageSize)
            .limit(pageSize)
            .exec();
        const categoryCount = await Category.countDocuments();
        if (!categories) {
            return res.status(404).json({ message: 'there is no categories' });
        }
        res.json({ data: categories, total: categoryCount });
    } catch (error) {
        res.json(error.message);
    }
};
const createCategory = (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    const category = new Category({
        name: req.body.name,
    });
    category.save().then((savedCategory) => {
        res.json({ message: 'success', savedCategory });
    }).catch((error) => {
        res.json({ message: 'error', error });
    });
};

const updateCategory = async (req, res) => {
    if (!checkRole.isAdmin(req, res)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        // const { body: { name } } = req;
        // const { body: { name } } = req;
        // const catId = req.params.id
        const cate = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'succes', cate });
    } catch (error) {
        console.log('dddddd');
        res.json({ message: 'error', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const cate = await Category.findByIdAndRemove(req.params.id);
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'success', cate });
    } catch (error) {
        res.json(error.message);
    }
};
const getAllBooksByCategoryId = async (req, res) => {
    try {
        const books = await Book.find({ categoryId: req.params.categoryId }).populate({

            path: 'AuthorId',
            select: 'firstName',
        }).exec();
        res.json({ data: books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllBooksByCategoryId,
};
