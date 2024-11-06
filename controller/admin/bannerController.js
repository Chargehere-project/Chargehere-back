// controller/bannerController.js

const AWS = require('aws-sdk');

// S3 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// 배너 이미지 가져오기
const getBanners = async (req, res) => {
    try {
        const banners = []; // 배너 이미지 URL 배열을 저장할 변수

        // S3에서 배너 목록 가져오기
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: 'banners/',
        };
        const data = await s3.listObjectsV2(params).promise();

        data.Contents.forEach((item) => {
            banners.push(
                `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
            );
        });

        res.status(200).json({ banners });
    } catch (error) {
        console.error('S3 배너 목록 가져오기 실패:', error);
        res.status(500).json({ error: 'S3 배너 목록을 가져오는데 실패했습니다.' });
    }
};

// 배너 이미지 업로드
const uploadBanner = async (req, res) => {
    try {
        const file = req.file;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `banners/${Date.now()}_${file.originalname}`, // 배너 파일 저장 경로
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const uploadResult = await s3.upload(params).promise();

        res.status(200).json({ fileUrl: uploadResult.Location });
    } catch (error) {
        console.error('배너 업로드 실패:', error);
        res.status(500).json({ error: '배너 업로드에 실패했습니다.' });
    }
};

// 배너 이미지 삭제
const deleteBanner = async (req, res) => {
    const { key } = req.body; // 삭제할 S3 객체 키

    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };
        await s3.deleteObject(params).promise();

        res.status(200).json({ message: '배너가 삭제되었습니다.' });
    } catch (error) {
        console.error('배너 삭제 실패:', error);
        res.status(500).json({ error: '배너 삭제에 실패했습니다.' });
    }
};

module.exports = {
    getBanners,
    uploadBanner,
    deleteBanner,
};
