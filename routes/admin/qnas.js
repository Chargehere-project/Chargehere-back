// routes/admin/qnas.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const { getQnAs, getQnAReply, replyToQnA, searchQnAs } = require('../../controller/admin/QnAController');

router.get('/', verifyToken, getQnAs);
router.get('/:qnaId/replies', verifyToken, getQnAReply);
router.post('/:qnaId/replies', verifyToken, replyToQnA);
router.get('/search', verifyToken, searchQnAs);

module.exports = router;
