const router = require('express').Router();
const { categoryController } = require('../controllers');

router.post('/', categoryController.createCategory);
router.patch('/:name', categoryController.updateCategory);
router.delete('/', categoryController.deleteCategory);

module.exports = router;
