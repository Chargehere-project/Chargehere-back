// routes/admin/index.js
const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/inquiries', require('./inquiries'));
router.use('/points', require('./points'));
router.use('/coupons', require('./coupons'));
router.use('/products', require('./products'));
router.use('/reviews', require('./reviews'));
router.use('/qnas', require('./qnas'));
router.use('/notices', require('./notices'));
// router.use('/banners', require('./banners'));
router.use('/auth', require('./auth'));
router.use('/', require('./upload'));
router.use('/transactions', require('./transactions'));

module.exports = router;
