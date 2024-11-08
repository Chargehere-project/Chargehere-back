const express = require('express');
const multer = require('multer');
const { uploadBanner, getBanners } = require('../../controller/admin/UploadController');
const router = express.Router();

// Multer 설정
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 파일 크기 제한 (2MB)
});

// 파일 업로드 라우트
router.post('/upload', upload.single('file'), uploadBanner);

// 배너 목록 가져오기 라우트
router.get('/getBanners', getBanners);

module.exports = router;
