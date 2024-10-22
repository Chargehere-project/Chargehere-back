const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    searchUsers,
    getAllUsers,
    updateUserStatus,
    updateUser,
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries, // 인쿼리 검색 기능 추가
} = require('../../controller/admin'); // 컨트롤러 파일에서 함수들을 불러옵니다

// 회원 관련 API 라우터
router.post('/users/signup', signup); // 회원가입
router.post('/users/login', login); // 로그인
router.get('/users/search', searchUsers); // 유저 검색
router.get('/users', getAllUsers); // 전체 유저 목록 조회
router.put('/users/:userId/status', updateUserStatus); // 유저 상태 업데이트
router.put('/users/:userId', updateUser); // 유저 정보 수정

// 문의 관련 API 라우터
router.get('/inquiries', getInquiries); // 문의 목록 조회
router.post('/inquiries', createInquiry); // 새로운 문의 생성
router.post('/inquiries/:inquiryId/replies', replyToInquiry); // 문의에 답변 추가 또는 수정
router.get('/inquiries/:inquiryId/replies', getReply); // 특정 문의의 답변 가져오기

// 새로운 문의 검색 라우터 추가
router.get('/inquiries/search', searchInquiries); // 검색 기능 추가

module.exports = router;