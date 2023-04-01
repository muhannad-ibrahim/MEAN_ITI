/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 15,
        required: [true, 'Please enter a first name'],
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 15,
        required: [true, 'Please enter a last name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter a email'],
        lowercase: [true, 'Email must be lowercase'],
        trim: true,
        unique: [true, 'Email already exists'],
        validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 10,
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
}, {
    toJSON: {
        transform(doc, ret) {
            // eslint-disable-next-line no-param-reassign
            delete ret.password;
        },
    },
});

userSchema.pre('save', function preSave(next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
