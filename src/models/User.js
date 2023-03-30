/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 15,
        required: true,
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 15,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'Please enter a email'],
        lowercase: true,
        trim: true,
        unique: true,
        validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minLength: [6, 'Minimum password length is 6 characters'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },

}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        },
    },
});

userSchema.pre('save', async function preSave(next) {
    const salt = await bcrypt.genSalt();
    this.password = bcrypt.hashSync(this.password, salt);
    next();
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.connect('User', userSchema);

module.exports = User;
