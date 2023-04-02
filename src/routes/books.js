const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { bookController } = require('../controllers');

/* eslint-disable comma-dangle */

const storage = multer.diskStorage({
    destination: './src/images/bookImg',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}}`);
    }
});

const upload = multer({
    storage,
});

router.get('/', bookController.getAllBooks);
router.post('/', upload.single('photo'), bookController.createBook);
router.get('/:id', bookController.getBookById);
router.patch('/:id', bookController.updateBookById);
router.delete('/:id', bookController.deleteBookById);

module.exports = router;
