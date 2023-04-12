/* eslint-disable no-undef */
const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { userBookController } = require('../controllers');

router.use(cookieParser());

router.post('/', userBookController.create);
router.get('/', userBookController.getUserBooks);
router.patch('/:id', userBookController.updatePushBook);
module.exports = router;
