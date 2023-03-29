const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (URL) => {
    mongoose.connect(URL)
        .then(() => {
            console.log('Database connected');
        })
        .catch((error) => {
            console.error('could not connect to DB', error);
        });
};
