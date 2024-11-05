// routes/admin/points.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getPointsHistory,
    updatePoints,
    cancelPoints,
    searchPoints,
    getTotalPointsCount,
} = require('../../controller/admin/PointsController');

router.get('/', verifyToken, getPointsHistory);
router.post('/', verifyToken, updatePoints);
router.post('/cancel', verifyToken, cancelPoints);
router.get('/search', verifyToken, searchPoints);
router.get('/count', verifyToken, getTotalPointsCount);

module.exports = router;
