const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { categoryController } = require('../controllers');

router.use(cookieParser());
router.post('/', categoryController.createCategory);
router.patch('/:name', categoryController.updateCategory);
router.delete('/', categoryController.deleteCategory);

module.exports = router;
