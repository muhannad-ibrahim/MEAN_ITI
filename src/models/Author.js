const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        required: [true, 'Please enter a first name'],
    },
    lastName: {
        type: String,
        minLength: 3,
        required: [true, 'Please enter a last name'],
    },
    photo: {
        type: String,
    },
    dob: {
        type: Date,
    },
    bio: {
        type: String,
        maxLength: 150,
        minLength: 20,
    },
}, {
    timestamps: true,
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
