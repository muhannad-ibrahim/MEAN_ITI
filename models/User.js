/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 10,
        required: true,
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 10,
        required: true,
    },
    email: {
        type: String,
        minLength: 3,
        maxLength: 10,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 10,
    },

}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        },
    },
});

userSchema.pre('save', function preSave(next) {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});
const User = mongoose.connect('User', userSchema);

module.exports = User;
