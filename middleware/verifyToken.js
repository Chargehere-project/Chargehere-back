const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.adminToken; // 쿠키에서 토큰 읽기
    if (!token) {
        return res.status(403).json({ message: '토큰이 필요합니다.' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        }
        req.user = decoded; // 유효한 토큰인 경우 요청에 사용자 정보 추가
        next();
    });
};

module.exports = verifyToken;
