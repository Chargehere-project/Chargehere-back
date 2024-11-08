// controller/admin/index.js

// Import each controller
const userController = require('./UserController');
const productController = require('./ProductController');
const couponController = require('./CouponController');
const inquiryController = require('./InquiryController');
const reviewController = require('./ReviewController');
const qnaController = require('./QnAController');
const noticeController = require('./NoticeController');
// const bannerController = require('./BannerController');
// const authController = require('./AdminAuthController');
const { adminLogin } = require('./AdminAuthController'); // 개별 메서드로 불러오기
const pointsController = require('./PointsController'); 
const uploadController = require('./UploadController');

// Export all controllers
module.exports = {
    ...userController,
    ...productController,
    ...couponController,
    ...inquiryController,
    ...reviewController,
    ...qnaController,
    ...noticeController,
    // ...bannerController,
    // ...authController,
    adminLogin, // 개별 메서드로 추가
    ...pointsController,
    ...uploadController,
};