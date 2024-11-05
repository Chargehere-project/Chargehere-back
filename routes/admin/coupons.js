// routes/admin/coupons.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    createCoupon,
    issueCoupon,
    getCoupons,
    editCoupon,
    getIssuedCoupons,
    updateCouponStatus,
    searchCoupons,
    // getTotalUserCouponsCount,
} = require('../../controller/admin/CouponController');

router.post('/', verifyToken, createCoupon);
router.post('/issue', verifyToken, issueCoupon);
router.get('/', verifyToken, getCoupons);
router.put('/:couponID', verifyToken, editCoupon);
router.get('/issued', verifyToken, getIssuedCoupons);
router.put('/:id/status', verifyToken, updateCouponStatus);
router.get('/search', verifyToken, searchCoupons);
// router.get('/count', verifyToken, getTotalUserCouponsCount);

module.exports = router;
