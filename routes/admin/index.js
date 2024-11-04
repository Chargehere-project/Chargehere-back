const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const {
    searchUsers,
    getAllUsers,
    updateUserStatus,
    updateUser,
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries,
    getPointsHistory,
    updatePoints,
    cancelPoints,
    searchPoints,
    createCoupon,
    issueCoupon,
    getCoupons,
    editCoupon,
    getIssuedCoupons,
    updateCouponStatus,
    searchCoupons,
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
    updateProductStatus,
    deleteProductImage,
    searchProducts,
    getReviews,
    editReview,
    deleteReview,
    updateReviewStatus,
    deleteReviewImage,
    searchReviews,
    getQnAs,
    getQnAReply,
    replyToQnA,
    searchQnAs,
    getNotices,
    createNotice,
    editNotice,
    deleteNotice,
    searchNotices,
    getTotalNoticesCount,
    getTotalPointsCount,
    getTotalUserCouponsCount,
} = require('../../controller/admin');

// 업로드 폴더 설정
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// 관리자 관련 API 라우터
// 유저 관리
router.get('/users/search', searchUsers);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId', updateUser);

// 문의 관리
router.get('/inquiries', getInquiries);
router.post('/inquiries', createInquiry);
router.post('/inquiries/:inquiryId/replies', replyToInquiry);
router.get('/inquiries/:inquiryId/replies', getReply);
router.get('/inquiries/search', searchInquiries);

// 포인트 관리
router.get('/points', getPointsHistory);
router.post('/points', updatePoints);
router.post('/points/cancel', cancelPoints);
router.get('/points/search', searchPoints);
router.get('/points/count', getTotalPointsCount);

// 쿠폰 관리
router.post('/coupons', createCoupon);
router.post('/coupons/issue', issueCoupon);
router.get('/coupons', getCoupons);
router.put('/coupons/:couponID', editCoupon);
router.get('/coupons/issued', getIssuedCoupons);
router.put('/coupons/:id/status', updateCouponStatus);
router.get('/coupons/search', searchCoupons);
router.get('/coupons/count', getTotalUserCouponsCount);

// 상품 관리
router.get('/products', getProducts);
router.post('/products', upload.single('thumbnail'), createProduct);
router.put('/products/:productId', upload.single('thumbnail'), editProduct);
router.delete('/products/:productId', deleteProduct);
router.put('/products/:productId/status', updateProductStatus);
router.delete('/products/:productId/thumbnail', deleteProductImage);
router.get('/products/search', searchProducts);

// 리뷰 관리
router.get('/reviews/', getReviews);
router.put('/reviews/:reviewId', upload.single('image'), editReview);
router.delete('/reviews/:reviewId', deleteReview);
router.put('/reviews/:reviewId/status', updateReviewStatus);
router.delete('/reviews/:reviewId/image', deleteReviewImage);
router.get('/reviews/search', searchReviews);

// QnA 관리
router.get('/qnas', getQnAs);
router.get('/qnas/:qnaId/replies', getQnAReply);
router.post('/qnas/:qnaId/replies', replyToQnA);
router.get('/qnas/search', searchQnAs);

// 공지사항 관리
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.put('/notices/:noticeId', editNotice);
router.delete('/notices/:noticeId', deleteNotice);
router.get('/notices/search', searchNotices);
router.get('/notices/count', getTotalNoticesCount);

module.exports = router;
