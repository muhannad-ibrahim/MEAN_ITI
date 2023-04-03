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
    destination: './src/images',
    filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage
});

router.get('/', userController.getAllUsers);
router.post('/signup', upload.single('photo'), userController.signup);
router.post('/login', userController.login);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
