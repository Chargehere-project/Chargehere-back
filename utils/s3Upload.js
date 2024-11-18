const AWS = require('aws-sdk');

// AWS S3 설정 (환경변수를 통해 인증 정보 설정)
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}_${file.originalname}`, // 파일 이름을 유니크하게 지정
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // 공개 읽기 권한 부여
    };

    try {
        const data = await s3.upload(params).promise();
        return data.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
        console.error('S3 업로드 오류:', error);
        throw error;
    }
};

module.exports = uploadToS3;
