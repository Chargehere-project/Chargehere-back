// routes/admin/notices.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getNotices,
    createNotice,
    editNotice,
    deleteNotice,
    searchNotices,
    getTotalNoticesCount,
} = require('../../controller/admin/NoticeController');

router.get('/', verifyToken, getNotices);
router.post('/', verifyToken, createNotice);
router.put('/:noticeId', verifyToken, editNotice);
router.delete('/:noticeId', verifyToken, deleteNotice);
router.get('/search', verifyToken, searchNotices);
router.get('/count', verifyToken, getTotalNoticesCount);

module.exports = router;
