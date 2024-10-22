require('dotenv').config();
const express = require('express');
const db = require('./models');
const app = express();
const PORT = 8000;
const cors = require('cors');

// CORS 설정
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 설정
const router = require('./routes');
app.use('/', router);

// '/api/admin' 경로로 라우터 매핑
app.use('/api/admin', router);

// Sequelize 동기화 (alter 옵션 사용하여 테이블 구조 동기화)
db.sequelize
    .sync({ alter: true })
    .then(() => {
        console.log('데이터베이스가 동기화되었습니다.');

        // 서버 시작
        app.listen(PORT, () => {
            console.log(`서버가 실행되었습니다. http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('데이터베이스 동기화 실패:', err);
    });
