// routes/admin/inquiries.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries,
} = require('../../controller/admin/InquiryController');

router.get('/', verifyToken, getInquiries);
router.post('/', verifyToken, createInquiry);
router.post('/:inquiryId/replies', verifyToken, replyToInquiry);
router.get('/:inquiryId/replies', verifyToken, getReply);
router.get('/search', verifyToken, searchInquiries);

module.exports = router;
