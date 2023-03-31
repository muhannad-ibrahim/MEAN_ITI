const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

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
        required: [true, 'Please enter a password'],
        minLength: [6, 'Minimum password length is 6 characters'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    photo: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            // eslint-disable-next-line no-param-reassign
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

const User = mongoose.model('User', userSchema);

module.exports = User;
