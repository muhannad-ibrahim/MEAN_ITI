const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const { authorController } = require('../controllers/index');

router.use(cookieParser());

const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        cb(null, `author_${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

/* eslint-disable comma-dangle */
router.get('/', authorController.getAuthorsPagination);
router.get('/all', authorController.getAllAuthors);

router.post('/', upload.single('photo'), authorController.createAuthor);
router.get('/:AuthorId', authorController.getAllAuthorsBooks);
router.get('/:id', authorController.getAuthorById);
router.patch('/:id', authorController.updateAuthorById);
router.delete('/:id', authorController.deleteAuthorById);

module.exports = router;
