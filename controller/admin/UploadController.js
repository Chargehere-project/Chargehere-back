const AWS = require('aws-sdk');

// 디버그 로그 활성화
AWS.config.update({ logger: console });


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// 파일 업로드 컨트롤러 함수
const uploadBanner = async (req, res) => {
    const file = req.file;
    const { category, index } = req.body;

    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // 업로드할 폴더 경로 설정
    const folder = category === 'banner_shop' ? `banner_shop/banner${index + 1}` : null;
    if (!folder) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${Date.now()}_${file.originalname}`, // 업로드할 파일 경로
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.upload(params).promise(); // S3에 파일 업로드
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: data.Location, // S3에서 파일의 URL
        });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ error: 'Error uploading file to S3' });
    }
};


// 카테고리에 따라 S3에서 배너 목록 가져오는 함수
const getBanners = async (req, res) => {
    try {
        const { category, index } = req.query;
        const folder = category === 'banner_shop' ? `banner_shop/banner${index + 1}` : null;

        if (!folder) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // S3에서 해당 폴더에 있는 객체 목록 가져오기
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: `${folder}/`,
        };

        console.log('S3 요청 매개변수:', params); // 요청 매개변수 로그

        const data = await s3.listObjectsV2(params).promise();

        console.log('S3 응답 데이터:', data); // 응답 데이터 로그

        // 최신 파일이 위에 오도록 정렬 (LastModified 내림차순)
        const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

        // 해당 폴더의 가장 최신 배너 URL 가져오기
        const bannerUrl = sortedContents[0]
            ? `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sortedContents[0].Key}`
            : '';

        res.status(200).json({ banner: bannerUrl });
    } catch (error) {
        console.error('Error fetching banners from S3:', error);
        res.status(500).json({ error: 'Error fetching banners from S3' });
    }
};






module.exports = { uploadBanner, getBanners };
