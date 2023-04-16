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
    const categoriesCount = await asyncWrapper(Category.countDocuments().exec());
    const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    let totalPages = 0;
    if ((categoriesCount[1] % pageSize) === 0) {
        const totalPage = categoriesCount[1] / pageSize;
        totalPages = parseInt(totalPage, 10);
    } else {
        const totalPage = categoriesCount[1] / pageSize;
        totalPages = parseInt(totalPage, 10) + 1;
    }
    const [error, categories] = await asyncWrapper(Category
        .find()
        .skip((pageNumber) * pageSize)
        .limit(pageSize)
        .exec());

    if (error) {
        return next(error);
    }
    if (categories.length === 0) {
        return res.status(404).json({ message: 'There are no categories' });
    }
    return res.json({
        message: 'success',
        data: categories,
        pages: totalPages,
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

    const promise = Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    const [err, cate] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!cate) {
        return next({ message: 'Category not found' });
    }

    return res.json({ message: 'success', cate });
};

const deleteCategory = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }
    const promise = Category.findByIdAndRemove(req.params.id);
    const [err, cate] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!cate) {
        return next({ message: 'Category not found' });
    }

    return res.json({ message: 'success', cate });
};

const getAllBooksByCategoryId = async (req, res, next) => {
    const promise = Book.find({ categoryId: req.params.categoryId }).populate({
        path: 'AuthorId',
        select: 'firstName',
    }).exec();
    const [err, books] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json({ data: books });
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesPagination,
    getAllBooksByCategoryId,
};
