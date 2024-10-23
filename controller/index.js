const { User } = require('../models');

// 회원가입 기능
const signup = async (req, res) => {
    const { id, password, name, residence, phone } = req.body;
    try {
        const result = await User.create({
            LoginID: id,
            Password: password,
            Name: name,
            Address: residence,
            PhoneNumber: phone,
            Points: 0,
            JoinDate: new Date(),
        });
        res.json({ result: true });
    } catch (error) {
        res.status(500).json({ result: false, message: '회원가입 실패' });
    }
};

// 로그인 기능
const login = async (req, res) => {
    const { userid, pw } = req.body;
    try {
        const result = await User.findOne({
            where: { LoginID: userid, Password: pw },
        });
        if (result) {
            res.json({ result: true, data: result });
        } else {
            res.status(401).json({ result: false, message: '로그인 실패' });
        }
    } catch (error) {
        res.status(500).json({ message: '로그인 에러' });
    }
};

module.exports = {
    signup,
    login,
};
