const AWS = require('aws-sdk');

// AWS S3 설정 (환경변수를 통해 인증 정보 설정)
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (file, customKey = null, contentType = null) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: customKey || `${Date.now()}_${file.originalname || 'file.html'}`, // 파일 이름
        Body: Buffer.isBuffer(file) ? file : Buffer.from(file), // ArrayBuffer를 Buffer로 변환
        ContentType: contentType || file.mimetype || 'text/html', // 기본 ContentType
        ACL: 'public-read', // 공개 읽기 권한
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location; // S3 URL 반환
    } catch (error) {
        console.error('S3 업로드 오류:', error);
        throw error;
    }
};

module.exports = uploadToS3;
