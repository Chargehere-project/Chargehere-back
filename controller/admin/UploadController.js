const AWS = require('aws-sdk');

// 디버그 로그 활성화
AWS.config.update({ logger: console });


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// 배너 업로드 함수
const uploadBanner = async (req, res) => {
    const file = req.file;
    const { category, index } = req.body;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = `${category}/banner${index + 1}`; // category와 index로 폴더 경로 설정

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${Date.now()}_${file.originalname}`, // 고유 파일 경로 설정
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.upload(params).promise();
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: data.Location,
        });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ error: 'Error uploading file to S3' });
    }
};

// S3에서 최신 배너 가져오기
const getBanners = async (req, res) => {
    const { category, index } = req.query;
    const folder = `${category}/banner${index + 1}`; // category와 index로 폴더 경로 설정

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: `${folder}/`,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
        const bannerUrl = sortedContents[0]
            ? `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sortedContents[0].Key}`
            : '';

        res.status(200).json({ banner: bannerUrl });
    } catch (error) {
        console.error('Error fetching banners from S3:', error);
        res.status(500).json({ error: 'Error fetching banners from S3' });
    }
};


const uploadFile = async (req, res, category) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = category === 'logo' ? 'logo' : 'favicon';
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${Date.now()}_${file.originalname}`, // 파일 경로 지정
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.upload(params).promise();
        res.status(200).json({
            message: `${category} uploaded successfully`,
            fileUrl: data.Location,
        });
    } catch (error) {
        console.error(`${category} Upload Error:`, error);
        res.status(500).json({ error: `Error uploading ${category} to S3` });
    }
};

const getLatestFile = async (req, res, category) => {
    const folder = category === 'logo' ? 'logo' : 'favicon';
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: `${folder}/`,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
        const fileUrl = sortedContents[0]
            ? `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sortedContents[0].Key}`
            : '';

        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error(`Error fetching ${category} from S3:`, error);
        res.status(500).json({ error: `Error fetching ${category} from S3` });
    }
};


const deleteFile = async (req, res, category) => {
    const folder = category === 'logo' ? 'logo' : 'favicon';
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: `${folder}/`, // 해당 폴더 내의 모든 파일을 삭제
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        if (data.Contents.length === 0) {
            return res.status(404).json({ message: 'No file found to delete' });
        }

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Delete: { Objects: data.Contents.map(({ Key }) => ({ Key })) },
        };
        await s3.deleteObjects(deleteParams).promise();
        res.status(200).json({ message: `${category} 파일이 성공적으로 삭제되었습니다.` });
    } catch (error) {
        console.error(`${category} 파일 삭제 실패:`, error);
        res.status(500).json({ message: `${category} 파일 삭제 실패` });
    }
};


module.exports = { uploadBanner, getBanners, uploadFile, getLatestFile, deleteFile};
