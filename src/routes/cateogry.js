const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { categoryController } = require('../controllers');

router.use(cookieParser());

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategoriesPagination);
router.get('/all', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getAllBooksByCategoryId);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
