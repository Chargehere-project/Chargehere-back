// routes/admin/users.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const { searchUsers, getAllUsers, updateUserStatus, updateUser } = require('../../controller/admin/UserController');

router.get('/search', verifyToken, searchUsers);
router.get('/', verifyToken, getAllUsers);
router.put('/:userId/status', verifyToken, updateUserStatus);
router.put('/:userId', verifyToken, updateUser);

module.exports = router;
