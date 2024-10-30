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
    getProducts, // 상품 목록 조회
    createProduct, // 상품 등록
    editProduct, // 상품 수정
    deleteProduct, // 상품 삭제
    updateProductStatus, // 상품 상태 변경
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
} = require('../../controller/admin'); // 관리자 관련 컨트롤러 가져오기

// 업로드 폴더 설정
const uploadsDir = path.join(__dirname, '../../uploads'); 
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // 파일을 uploads 폴더에 저장
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});




const upload = multer({ storage: storage });


// 관리자 관련 API 라우터 (유저 관리)
router.get('/users/search', searchUsers); // 유저 검색
router.get('/users', getAllUsers); // 전체 유저 목록 조회
router.put('/users/:userId/status', updateUserStatus); // 유저 상태 업데이트
router.put('/users/:userId', updateUser); // 유저 정보 수정

// 관리자 관련 API 라우터 (문의 관리)
router.get('/inquiries', getInquiries); // 문의 목록 조회
router.post('/inquiries', createInquiry); // 새로운 문의 생성
router.post('/inquiries/:inquiryId/replies', replyToInquiry); // 문의 답변 추가 또는 수정
router.get('/inquiries/:inquiryId/replies', getReply); // 특정 문의의 답변 가져오기
router.get('/inquiries/search', searchInquiries); // 문의 검색

// 포인트 관련 API 라우터
router.get('/points', getPointsHistory); // 포인트 내역 조회
router.post('/points', updatePoints); // 포인트 추가/차감
router.post('/points/cancel', cancelPoints); // 포인트 취소
router.get('/points/search', searchPoints); // 포인트 검색

// 쿠폰 관련 API 라우터
router.post('/coupons', createCoupon); // 쿠폰 생성
router.post('/coupons/issue', issueCoupon); // 쿠폰 발급
router.get('/coupons', getCoupons); // 쿠폰 리스트 조회 (페이지네이션)
router.put('/coupons/:couponID', editCoupon); // 쿠폰 수정
router.get('/coupons/issued', getIssuedCoupons); // 발급된 쿠폰 리스트 조회 (페이지네이션)
router.put('/coupons/:id/status', updateCouponStatus); // 쿠폰 상태 업데이트

// 쿠폰 검색 라우터 추가
router.get('/coupons/search', searchCoupons); // 쿠폰 검색

// 상품 관련 API 라우터
router.get('/products', getProducts); // 상품 목록 조회 (페이지네이션)
router.post('/products', upload.single('thumbnail'), createProduct); // 상품 등록
router.put('/products/:productId', upload.single('thumbnail'), editProduct);
router.delete('/products/:productId', deleteProduct); // 상품 삭제
router.put('/products/:productId/status', updateProductStatus); // 상품 상태 변경
router.delete('/products/:productId/thumbnail', deleteProductImage);
router.get('/products/search', searchProducts);


router.get('/reviews/', getReviews);
router.put('/reviews/:reviewId', upload.single('image'), editReview); // 'image' 필드로 설정
router.delete('/reviews/:reviewId', deleteReview); // 리뷰 삭제
router.put('/reviews/:reviewId/status', updateReviewStatus); // 상품 상태 변경
router.delete('/reviews/:reviewId/image', deleteReviewImage);
router.get('/reviews/search', searchReviews);

// QnA 목록 가져오기 - 페이지네이션 포함
router.get('/qnas', getQnAs);

// 특정 QnA의 답변 가져오기
router.get('/qnas/:qnaId/replies', getQnAReply);

// QnA 답변 추가 또는 수정
router.post('/qnas/:qnaId/replies', replyToQnA);

// QnA 검색
router.get('/qnas/search', searchQnAs);


module.exports = router;
