const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
    const headers = req.headers.authorization;
    if (!headers) {
        return res.status(401).json({ result: false });
    }
    const [bearer, token] = headers.split(' ');
    if (bearer === 'Bearer') {
        //jwt인증
        jwt.verify(token, process.env.SECRET, (err, decode) => {
            if (err) {
                return res.status(403).json({ result: false });
            }
            req.userInfo = decode; //다음 미들웨어로 전달하는값
            next();
        });
    } else {
        return res.status(401).json({ result: false });
    }
};
