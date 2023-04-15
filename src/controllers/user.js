/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const UserBook = require('../models/userBooks');
const cloudinary = require('../utils/cloudinary');

const asyncWrapper = require('../middleware');
const checkRole = require('../middleware/checkRole');

const { JWT_SECRET } = process.env;

const signup = async (req, res, next) => {
    let imageURL = '';
    if (req.file) {
        imageURL = await cloudinary.uploader.upload(req.file.path);
    }
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        photo: imageURL,
    });

    const promise = user.save();
    const [err, data] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }
    const aaaa = await UserBook.create({ userId: data._id });
    return res.json({ message: 'success', aaaa });
};

const getAllUsers = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const itemPerPage = 5;
    const currentPage = parseInt(req.query.page, 10) || 1;

    const promise = User.paginate({}, { page: currentPage, limit: itemPerPage });
    const [err, users] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (users.docs.length === 0) {
        return next(new Error('There are no users'));
    }

    return res.json({
        message: 'success',
        data: users.docs,
        pages: users.totalPages,
        currentPage: users.page,
        nextPage: users.hasNextPage ? users.nextPage : null,
        prevPage: users.hasPrevPage ? users.prevPage : null,
    });
};

const getUserById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const promise = User.findById(req.params.id);
    const [err, user] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json(user);
};

const updateUserById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const {
        body: {
            firstName, lastName, email, role,
        },
    } = req;

    const promise = User.findByIdAndUpdate(req.params.id, {
        firstName, lastName, email, role,
    });
    const [err, user] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    return res.json(user);
};

const deleteUserById = async (req, res, next) => {
    const isUserAdmin = await checkRole.isAdmin(req);
    if (!isUserAdmin) {
        return res.status(401).json({ message: 'You are not an admin' });
    }

    const promise = User.findByIdAndRemove(req.params.id);
    const [err, user] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!user) {
        return next({ message: 'User not found' });
    }

    return res.json({ message: 'success', user });
};

const login = async (req, res, next) => {
    const { body: { email, password } } = req;

    const promise = User.findOne({ email }).exec();
    const [err, user] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!user) {
        return next({ message: 'User not found' });
    }

    const valid = user.verifyPassword(password);

    if (!valid) {
        return next({ message: 'UNAUTHENTICATED to login' });
    }

    const token = jwt.sign({ email, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    try {
        res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 });
    } catch (error) {
        return res.json({ message: 'error' });
    }

    return res.json({ message: 'success', token });
};

const getUserProfile = async (req, res, next) => {
    const cookie = req.cookies.jwt;

    let payload;
    try {
        payload = jwt.verify(cookie, JWT_SECRET);
    } catch (err) {
        return next({ message: 'UNAUTHENTICATED to get user profile' });
    }

    const promise = User.findOne({ email: payload.email }).exec();
    const [err, user] = await asyncWrapper(promise);

    if (err) {
        return next(err);
    }

    if (!user) {
        return next({ message: 'User not found' });
    }

    const { _id, ...data } = await user.toJSON();

    return res.send(data);
};

const logout = async (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'User logged out' });
};

const displayLogoutMessage = async (req, res) => res.send('logout successfully');

module.exports = {
    signup,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserProfile,
    login,
    logout,
    displayLogoutMessage,
};
