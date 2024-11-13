const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Admin } = require('../../models'); // Admin 모델 가져오기
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_admin_secret_key';

const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Admin 모델에서 로그인 ID가 일치하는 사용자를 찾습니다.
        const adminUser = await Admin.findOne({ where: { LoginID: username } });

        // 사용자가 존재하지 않으면 401 Unauthorized 응답을 반환합니다.
        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 사용자의 비밀번호가 유효한지 확인합니다.
        const isPasswordValid = await bcrypt.compare(password, adminUser.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // JWT 토큰 생성
        const token = jwt.sign({ AdminID: adminUser.AdminID, LoginID: adminUser.LoginID }, SECRET_KEY, {
            expiresIn: '1h', // 토큰 만료 시간 1시간
        });

        // JWT 토큰을 쿠키에 저장하여 클라이언트에 전달
        res.cookie('adminToken', token, {
            httpOnly: true, // JavaScript로 접근 불가
            secure: false, // 로컬에서 쿠키 사용 가능, 배포 시 true로 변경 권장
            maxAge: 3600000, // 쿠키 만료 시간 1시간
            sameSite: 'lax', // 크로스 사이트 요청 보안 설정
        });

        // 로그인 성공 메시지를 JSON 형식으로 반환
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { adminLogin };
