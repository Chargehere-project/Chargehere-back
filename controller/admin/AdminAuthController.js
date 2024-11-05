const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Admin } = require('../../models'); // Admin 모델 가져오기
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_admin_secret_key';


const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const adminUser = await Admin.findOne({ where: { LoginID: username } });

        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, adminUser.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ AdminID: adminUser.AdminID, LoginID: adminUser.LoginID }, SECRET_KEY, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { adminLogin };
