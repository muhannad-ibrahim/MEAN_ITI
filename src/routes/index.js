const router = require('express').Router();

router.use('/users', require('./user'));
router.use('/books', require('./books'));
router.use('/authors', require('./author'));
router.use('/categories', require('./cateogry'));
router.use('/userBook', require('./userBook'));

module.exports = router;
