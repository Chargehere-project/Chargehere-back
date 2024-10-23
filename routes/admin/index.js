const express = require('express');
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
    getPointsHistory, // 포인트 내역 조회 API 추가
    updatePoints, // 포인트 변경 API 추가
    cancelPoints,
    searchPoints,
} = require('../../controller/admin'); // 관리자 관련 컨트롤러 가져오기

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
router.post('/points/cancel', cancelPoints);
// 포인트 검색 라우터 설정
router.get('/points/search', searchPoints);

module.exports = router;
