const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const { bookController } = require('../controllers');

router.use(cookieParser());
/* eslint-disable comma-dangle */

const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        cb(null, `book_${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
});

router.get('/', bookController.getAllBooks);
router.post('/', upload.single('photo'), bookController.createBook);
router.get('/popularity', bookController.popularBook);
router.get('/:id', bookController.getBookById);
router.patch('/:id', upload.single('photo'), bookController.updateBookById);
router.delete('/:id', bookController.deleteBookById);

module.exports = router;
