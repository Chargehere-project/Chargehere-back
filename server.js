require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./models');
const app = express();
const PORT = 8000;
const cors = require('cors');
const session = require('express-session'); 
const FileStore = require('session-file-store')(session);

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',  // 쿠키 이름 설정
    cookie: {
        httpOnly: true,
        secure: false,  // HTTPS가 아닌 환경에서는 false
        maxAge: 24 * 60 * 60 * 1000,  // 24시간
        sameSite: 'lax',
        path: '/'
    }
}));

// 세션 작동 확인용 미들웨어
app.use((req, res, next) => {
    console.log('Request Session:', {
        sessionID: req.sessionID,
        session: req.session,
        cookies: req.cookies
    });
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /uploads 폴더를 정적으로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 설정
const router = require('./routes/front');
app.use('/', router);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// Sequelize 동기화 (alter 옵션 사용하여 테이블 구조 동기화)
db.sequelize
    .sync({ force: false })
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
