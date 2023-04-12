const router = require('express').Router();
const { userBookController } = require('../controllers');

router.post('/', userBookController.create);
router.get('/', userBookController.getUserBooks);
router.patch('/:id', userBookController.updatePushBook);
module.exports = router;
