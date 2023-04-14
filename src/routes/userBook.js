/* eslint-disable no-undef */
const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { userBookController } = require('../controllers');

router.use(cookieParser());

// router.post('/:id', userBookController.create);
router.get('/', userBookController.getUserBooks);
router.patch('/:id', userBookController.updatePushBook);
router.delete('/:id', userBookController.deleteBook);
module.exports = router;
