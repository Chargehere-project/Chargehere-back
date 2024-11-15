const express = require('express');
const multer = require('multer');
const {
    uploadFile,
    getLatestFile,
    uploadBanner,
    getBanners,
    deleteFile,
} = require('../../controller/admin/UploadController');
const router = express.Router();

// Multer 설정
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 파일 크기 제한 (2MB)
});

// 배너 관련 라우트 (기존 유지)
router.post('/upload/banner', upload.single('file'), uploadBanner);
router.get('/getBanners', getBanners);

// 로고 및 파비콘 관련 라우트
router.post('/upload/logo', upload.single('file'), (req, res) => uploadFile(req, res, 'logo'));
router.get('/files/logo', (req, res) => getLatestFile(req, res, 'logo'));

router.post('/upload/favicon', upload.single('file'), (req, res) => uploadFile(req, res, 'favicon'));
router.get('/files/favicon', (req, res) => getLatestFile(req, res, 'favicon'));

// 로고 및 파비콘 삭제 라우트
router.delete('/files/logo', (req, res) => deleteFile(req, res, 'logo'));
router.delete('/files/favicon', (req, res) => deleteFile(req, res, 'favicon'));

module.exports = router;
