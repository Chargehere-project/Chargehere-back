const multer = require('multer');

// 저장소를 메모리로 설정하여 파일을 buffer로 받음
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 25MB로 파일 크기 제한
    },
});

module.exports = upload;
