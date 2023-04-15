const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../../.env' });

// eslint-disable-next-line consistent-return
const isAdmin = async (req) => {
    try {
        let token;
        // const token = req.cookies.jwt;
        if (
            req.headers.authorization
              && req.headers.authorization.startsWith('Bearer')
        ) {
            // eslint-disable-next-line prefer-destructuring
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return false;
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return false;
        }
        if (user.role === 'admin') {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

module.exports = {
    isAdmin,
};
