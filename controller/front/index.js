const { User, Notice, Points, UserCoupon, Products } = require('../../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { where } = require('sequelize');

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
        const find = await User.findOne({ where: { LoginID: id } });
        if (find) {
            if (find.Password === password) {
                //jwt토큰 발생
                /**
                 * expiresIn: 만료시간
                 * algorithm: 서명 알고리즘 지정
                 * issuer: 토큰발급자 지정
                 */
                const token = jwt.sign({ UserID: find.UserID, LoginID: find.LoginID }, process.env.SECRET, {
                    expiresIn: '24h',
                });
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
const notices = async (req, res) => {
    try {
        const result = await Notice.findAll({
            order: [['NoticeID', 'DESC']],
            attributes: ['NoticeID', 'Title', 'PostDate'],
        });
        res.json({ result });
    } catch (error) {
        console.error('공지사항 조회 오류', error);
        res.status(500).json({ result: false, message: '공지사항 조회 오류' });
    }
};
const everydayevent = async (req, res) => {
    try {
        console.log(req.body, '출석이벤트');
        const { points, reward } = req.body;
        const userId = req.user.UserID; // 미들웨어에서 설정한 user 정보 사용
        const user = await User.findByPk(userId);

        const result = await Points.create({
            UserID: userId,
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: 'Earned',
            Amount: points,
            Description: '출석이벤트',
        });

        user.Points += points;
        await user.save();
        res.json({ result: true, message: '포인트 지급 성공' });
    } catch (error) {
        console.error('포인트 지급 오류', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
};

// controller/front/index.js
// controller/front/index.js
const getChargers = async (req, res) => {
    try {
        // 충전소 기본 정보 가져오기 (위치 정보 포함)
        const stationResponse = await axios.get('http://apis.data.go.kr/B552584/EvCharger/getChargerInfo', {
            params: {
                serviceKey: process.env.SERVICEKEY,
                pageNo: 1,
                numOfRows: 200, // 더 많은 데이터 가져오기
                zcode: req.query.zcode, // 지역 코드 추가
            },
        });

        // 충전기 상태 정보 가져오기
        const statusResponse = await axios.get('http://apis.data.go.kr/B552584/EvCharger/getChargerStatus', {
            params: {
                serviceKey: process.env.SERVICEKEY,
                pageNo: 1,
                numOfRows: 200,
                zcode: req.query.zcode,
            },
        });

        const stations = stationResponse.data.items[0].item;
        const statuses = statusResponse.data.items[0].item;

        // 위치 정보가 있는 충전소 데이터만 필터링하고 상태 정보 병합
        const mergedData = stations
            .filter((station) => station.lat && station.lng) // 위치 정보가 있는 것만 필터링
            .map((station) => {
                const status = statuses.find((s) => s.statId === station.statId);
                return {
                    ...station,
                    stat: status?.stat || '9', // 상태 정보 추가 (없으면 9=상태미확인)
                    statUpdDt: status?.statUpdDt,
                    lastTsdt: status?.lastTsdt,
                    lastTedt: status?.lastTedt,
                    nowTsdt: status?.nowTsdt,
                };
            });

        res.json({
            success: true,
            data: mergedData,
            totalCount: mergedData.length,
        });
    } catch (error) {
        console.error('충전소 데이터 조회 오류:', error);
        console.error('Error details:', error.response?.data);
        res.status(500).json({
            success: false,
            error: '충전소 데이터 조회 실패',
            message: error.message,
        });
    }
};

const name = async (req, res) => {
    try {
        const { userId } = req.body;
        const find = await User.findOne({ where: { UserID: userId } });
        res.json({ result: true, name: find.Name, point: find.Points });
    } catch (error) {
        console.error('이름과 포인트 조회 오류', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
};
const chargelist = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(req.body, '충전내역');
        const find = await Points.findAll({ where: { UserID: userId }, order: [['ChargeDate', 'DESC']], limit: 5 });
        res.json({ result: true, data: find });
    } catch (error) {
        console.error('충전내역 오류', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
};

const couponlist = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(req.body, '충전내역');
        const find = await UserCoupon.findAll({
            where: { UserID: userId },
            include: [
                {
                    model: Coupons,
                    attributes: ['CouponName', 'StartDate', 'ExpirationDate'],
                },
            ],
        });
        res.json({ result: true, data: find });
    } catch (error) {
        console.error('충전내역 오류', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
};

const products = async (req, res) => {
    try {
        const find = await Products.findAll({
            attributes: ['ProductID', 'ProductName', 'Price', 'Discount', 'Image'],
        });

        res.json({ result: true, data: find });
    } catch (error) {
        console.error('상품오류', error);
        res.status(500).json({ result: false, message: '서버오류' });
    }
};

module.exports = { signup, login, notice, everydayevent, notices, getChargers, name, chargelist, couponlist, products };
