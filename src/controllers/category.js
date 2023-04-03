/* eslint-disable consistent-return */
const Category = require('../models/Category');
const checkRole = require('../middleware/checkRole');

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
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        // const { body: { name } } = req;
        const cate = await Category.findOneAndUpdate(
            { name: req.params.name },
            { name: req.body.name },
        );
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'succes', cate });
    } catch (error) {
        res.json({ message: 'error', error });
    }
};

const deleteCategory = async (req, res) => {
    if (!checkRole.isAdmin(req)) {
        res.json({ message: 'error', error: 'you are not admin' });
    }
    try {
        const cate = await Category.findOne({ name: req.body.name }).exec();
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await Category.findByIdAndRemove(req.params.id);
        res.send({ message: 'success' });
    } catch (error) {
        res.json(error.message);
    }
};

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
};
