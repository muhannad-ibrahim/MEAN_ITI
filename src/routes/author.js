const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const { authorController } = require('../controllers/index');

router.use(cookieParser());

const storage = multer.diskStorage({
    destination: './src/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

/* eslint-disable comma-dangle */
router.get('/', authorController.getAllAuthors);
router.post('/', upload.single('photo'), authorController.createAuthor);
router.get('/:id', authorController.getAuthorById);
router.patch('/:id', authorController.updateAuthorById);
router.delete('/:id', authorController.deleteAuthorById);

module.exports = router;
