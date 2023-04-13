const mongoose = require('mongoose');
const dotenv = require('dotenv');
const asyncWrapper = require('./middleware');

dotenv.config();

module.exports = async (URL) => {
    const [err] = await asyncWrapper(mongoose.connect(URL));
    if (err) {
        console.error('could not connect to DB', err.message);
    } else {
        console.log('Database connected');
    }
};
