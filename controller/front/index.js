const { User, Notice, Points } = require('../../models');
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
    console.log(req.body, '회원가입');
    const { id, password, name, residence, phone } = req.body;
    const result = await User.create({
        LoginID: id,
        Password: password,
        Name: name,
        Address: residence,
        phone: phone,
        Points: 0,
        JoinDate: new Date(),
    });
    res.json({ result: true });
};
const login = async (req, res) => {
    try {
        console.log(req.body, '로그인');
        const { id, password } = req.body;
        const find = await User.findOne({ where: { LoginID:id } });
        if (find) {
            if (find.Password === password) {
                //jwt토큰 발생
                /**
                 * expiresIn: 만료시간
                 * algorithm: 서명 알고리즘 지정
                 * issuer: 토큰발급자 지정
                 */
                const token = jwt.sign({ UserID: find.UserID, LoginID: find.LoginID }, process.env.SECRET, { expiresIn: '24h' });
                console.log(process.env.SECRET);
                const response = {
                    // id: find.id,
                    // userId: find.userId,
                    token,
                };
                res.json({ result: true, code: 100, response, message: '로그인 성공' });
            } else {
                res.json({ result: false, code: 1000, response: null, message: '비밀번호 틀렸습니다.' });
            }
        } else {
            res.json({ result: false, code: 1001, response: null, message: '회원이 아닙니다.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: false, message: '서버오류' });
    }
};
const notice = async (req, res) => {
    try {
        const result = await Notice.findOne({
            order: [['NoticeID', 'DESC']],
            attributes: ['Title'],
        });

        if (!result) {
            return res.status(404).json({ result: false, message: '공지사항이 없습니다.' });
        }

        res.json({ result: true, data: result.Title });
    } catch (error) {
        console.error('공지사항 조회 중 오류 발생:', error);
        res.status(500).json({ result: false, message: '서버 오류가 발생했습니다.' });
    }
};
const notices = async (req,res) => {
    try{
        const result = await Notice.findAll({
            order: [['NoticeID', 'DESC']],
            attributes: ['NoticeID', 'Title', 'PostDate']
        })
        res.json({result})
    }
    catch(error){
        console.error('공지사항 조회 오류', error);
        res.status(500).json({result: false, message:'공지사항 조회 오류'})
        
    }
}

const everydayevent = async (req,res) =>{
    try{
        console.log(req.body, '출석이벤트');
        const { points,reward } = req.body;
        const userId = req.user.UserID;  // 미들웨어에서 설정한 user 정보 사용
        const user = await User.findByPk(userId);

        const result = await Points.create({
            UserID: userId,
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: 'Earned',
            Amount: points,
            Description: '출석이벤트',
        })

        user.Points += points
        await user.save();
        res.json({result:true,message:'포인트 지급 성공'})

    }
    catch (error) {
        console.error('포인트 지급 오류',error)
        res.status(500).json({result:false, message:'서버 오류'})
    }
}

const getChargers = async (req, res) => {
    try {
        const response = await axios.get('http://apis.data.go.kr/B552584/EvCharger/getChargerStatus', {
            params: {
                serviceKey: process.env.SERVICEKEY,
                ...req.query
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('충전소 데이터 조회 오류:', error);
        res.status(500).json({ error: '충전소 데이터 조회 실패' });
    }
};

module.exports = { signup, login, notice, everydayevent, notices, getChargers };
