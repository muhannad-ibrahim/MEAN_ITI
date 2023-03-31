const router = require('express').Router();
const { bookController } = require('../controllers');

/* eslint-disable comma-dangle */

router.get('/', bookController.getAllBooks);
router.post('/', bookController.createBook);
router.get('/:id', bookController.getBookById);
// router.patch('/:id', bookController.updateBookById);
// router.delete('/:id', bookController.deleteBookById);

module.exports = router;
