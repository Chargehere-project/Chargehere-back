require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./models');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /uploads 폴더를 정적으로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 프론트엔드용 라우터 설정
const frontRouter = require('./routes/front');
app.use('/', frontRouter);

// 관리자 API 라우터 설정
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// 관리자 인증 라우터 설정 (인증 관련 경로만 포함)
const adminAuthRouter = require('./routes/admin/auth'); // 인증 관련 라우터만 사용
app.use('/api/admin/auth', adminAuthRouter);

// Sequelize 동기화
db.sequelize
    .sync({ force: false })
    .then(() => {
        console.log('데이터베이스가 동기화되었습니다.');

        app.listen(PORT, () => {
            console.log(`서버가 실행되었습니다. http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('데이터베이스 동기화 실패:', err);
    });
