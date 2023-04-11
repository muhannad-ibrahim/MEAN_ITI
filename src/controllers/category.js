/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Category = require('../models/Category');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        if (categories.length === 0) {
            return res.status(404).json({ message: 'there is no categories' });
        }
        return res.json({ message: 'success', data: categories });
    } catch (error) {
        return res.json({ message: 'error', error: error.message });
    }
};

const getCategoriesPagination = async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const itemPerPage = 5;
    try {
        const categories = await Category.paginate({}, { page: currentPage, limit: itemPerPage });
        if (categories.docs.length === 0) {
            return res.status(404).json({ message: 'there is no categories' });
        }
        return res.json({
            message: 'success',
            data: categories.docs,
            pages: categories.totalPages,
            currentPage: categories.page,
            nextPage: categories.hasNextPage ? categories.nextPage : null,
            prevPage: categories.hasPrevPage ? categories.prevPage : null,

        });
    } catch (error) {
        return res.json({ message: 'error', error: error.message });
    }
};

const createCategory = (req, res) => {
    if (!checkRole.isAdmin(req)) {
        return res.json({ message: 'error', error: 'you are not admin' });
    }
    const category = new Category({
        name: req.body.name,
    });
    category.save().then((savedCategory) => res.json({ message: 'success', savedCategory }))
        .catch((error) => res.json({ message: 'error', error }));
};

const updateCategory = async (req, res) => {
    if (!checkRole.isAdmin(req, res)) {
        return res.json({ message: 'error', error: 'you are not admin' });
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
        return res.json({ message: 'error', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        return res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const cate = await Category.findByIdAndRemove(req.params.id);
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.json({ message: 'success', cate });
    } catch (error) {
        return res.json(error.message);
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
    getCategoriesPagination,
};
