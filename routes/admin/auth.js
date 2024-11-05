// routes/admin/auth.js
const express = require('express');
const router = express.Router();
const { adminLogin } = require('../../controller/admin/AdminAuthController');
const verifyToken = require('../../middleware/verifyToken'); // 토큰 검증 미들웨어 가져오기

router.post('/login', adminLogin);
router.get('/verify', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;
