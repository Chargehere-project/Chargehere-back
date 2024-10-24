const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    try {
        // 토큰 확인을 위한 로그
        console.log('Authorization Header:', req.headers.authorization);
        
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: '토큰이 없습니다.' 
            });
        }

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log('Decoded Token:', decoded);  // 디코드된 토큰 확인
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다.'
            });
        }
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.'
        });
    }
};