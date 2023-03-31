const router = require('express').Router();
const { userController } = require('../controllers');

/* eslint-disable comma-dangle */

router.get('/', userController.getAllUsers);
router.post('/signup', userController.create);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
