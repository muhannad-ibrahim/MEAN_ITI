/* eslint-disable radix */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Category = require('../models/Category');
const Book = require('../models/Book');
const checkRole = require('../middleware/checkRole');
const asyncWrapper = require('../middleware');

const getAllCategories = async (req, res, next) => {
    const promise = Category.find({});
    const [err, categories] = await asyncWrapper(promise);
    if (err) {
        return next(err);
    }
    if (categories.length === 0) {
        return next({ message: 'There is no categories' });
    }
    return res.json({ message: 'success', data: categories });
};

const getCategoriesPagination = async (req, res, next) => {
    const currentPage = parseInt(req.query.page) || 1;
    const itemPerPage = 5;

    const promise = Category.paginate({}, { page: currentPage, limit: itemPerPage });
    const [err, categories] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (categories.docs.length === 0) {
        return next({ message: 'There is no categories' });
    }

    return res.json({
        message: 'success',
        data: categories.docs,
        pages: categories.totalPages,
        currentPage: categories.page,
        nextPage: categories.hasNextPage ? categories.nextPage : null,
        prevPage: categories.hasPrevPage ? categories.prevPage : null,
    });
};

const createCategory = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const category = new Category({
        name: req.body.name,
    });

    const promise = category.save();
    const [err, savedCategory] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ message: 'success', savedCategory });
};

const updateCategory = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    try {
        const promise = Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        const [err, cate] = await asyncWrapper(promise);

        if (err) {
            return next(err);
        }

        if (!cate) {
            return next({ message: 'Category not found' });
        }

        return res.json({ message: 'success', cate });
    } catch (error) {
        return res.json({ message: 'error', error: error.message });
    }
};

const deleteCategory = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    try {
        const promise = Category.findByIdAndRemove(req.params.id);
        const [err, cate] = await asyncWrapper(promise);

        if (err) {
            return next(err);
        }

        if (!cate) {
            return next({ message: 'Category not found' });
        }

        return res.json({ message: 'success', cate });
    } catch (error) {
        return next(error);
    }
};

const getAllBooksByCategoryId = async (req, res, next) => {
    try {
        const promise = Book.find({ categoryId: req.params.categoryId }).populate({
            path: 'AuthorId',
            select: 'firstName',
        }).exec();
        const [err, books] = await asyncWrapper(promise);

        if (err) {
            return next(err);
        }

        return res.json({ data: books });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesPagination,
    getAllBooksByCategoryId,
};
