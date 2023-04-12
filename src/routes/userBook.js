const router = require('express').Router();
const { userBookController } = require('../controllers');

router.post('/', userBookController.create);
// router.get('/', userBookController.getAlluserBooks);
module.exports = router;
