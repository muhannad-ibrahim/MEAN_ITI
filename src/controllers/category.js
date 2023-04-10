/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Category = require('../models/Category');
const checkRole = require('../middleware/checkRole');

const getAllCategories = async (req, res) => {
    const itemPerPage = 5;
    const currentPage = parseInt(req.query.page) || 1;
    try {
        const categories = await Category.paginate({}, { page: currentPage, limit: itemPerPage });
        if (categories.docs.length === 0) {
            return res.status(404).json({ message: 'there is no categories' });
        }
        res.json({
            message: 'success',
            data: categories.docs,
            pages: categories.totalPages,
            currentPage: categories.page,
            nextPage: categories.hasNextPage ? categories.nextPage : null,
            prevPage: categories.hasPrevPage ? categories.prevPage : null,

        });
    } catch (error) {
        res.json({ message: 'error', error: error.message });
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
        console.log(req.body.name);
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

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
