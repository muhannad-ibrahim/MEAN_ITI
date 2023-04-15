/* eslint-disable no-undef */
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const { userController } = require('../controllers');

router.use(cookieParser());
/* eslint-disable comma-dangle */

// multer to sorage image
const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => cb(null, `user_${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage
});

router.get('/profile', userController.getUserProfile);
router.get('/logout', userController.logout, userController.displayLogoutMessage);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/signup', upload.single('photo'), userController.signup);
router.post('/login', userController.login);
router.patch('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
