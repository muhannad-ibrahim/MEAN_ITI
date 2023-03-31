const router = require('express').Router();
const { userController } = require('../controllers');

/* eslint-disable comma-dangle */

router.post('/', userController.create);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
