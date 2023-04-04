const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../../.env' });

// eslint-disable-next-line consistent-return
const isAdmin = async (req, res) => {
    // Get the access token from the request headers
    try {
        const token = req.cookies.jwt;

        // Verify the token and get the payload
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Check the user's role
        if (user.role === 'admin') {
        // If the user is an admin, return true
            return true;
        }
        // If the user is a regular user, return false
        return false;
    } catch (err) {
        // If there is an error verifying the token, return an error response
        res.json({ message: 'error', err });
        // return false;
    }
};

module.exports = {
    isAdmin,
};
