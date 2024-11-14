// controller/admin/PointsController.js
const { User, Points } = require('../../models');
const { Op } = require('sequelize');

// 포인트 내역 조회 기능 - 페이지네이션 적용
const getPointsHistory = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Points.findAndCountAll({
            include: [{ model: User, attributes: ['LoginID'], as: 'PointUser' }], // LoginID 포함
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            points: rows,
        });
    } catch (error) {
        console.error('포인트 내역 조회 실패:', error);
        res.status(500).json({ message: '포인트 내역 조회 실패', error });
    }
};

// 포인트 추가/차감 기능
const updatePoints = async (req, res) => {
    const { loginID, Amount, Description } = req.body;

    try {
        const user = await User.findOne({ where: { LoginID: loginID } }); // LoginID로 조회
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        const newPoints = await Points.create({
            UserID: user.UserID, // UserID를 외래 키로 저장
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: Amount > 0 ? 'Earned' : 'Deducted',
            Amount,
            Description,
        });

        // 유저의 총 포인트 업데이트
        if (user.Points !== undefined) {
            user.Points += Amount;
            await user.save();
        }

        res.json({ message: '포인트가 성공적으로 변경되었습니다.', newPoints });
    } catch (error) {
        console.error('포인트 변경 실패:', error);
        res.status(500).json({ message: '포인트 변경 실패', error });
    }
};

// 포인트 취소 기능
const cancelPoints = async (req, res) => {
    const { pointID, loginID, Amount, Description } = req.body;

    if (!loginID) {
        return res.status(400).json({ message: '로그인 ID가 필요합니다.' });
    }

    try {
        const user = await User.findOne({ where: { LoginID: loginID } }); // LoginID로 조회
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        const newPoints = await Points.create({
            UserID: user.UserID,
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: 'Deducted',
            Amount,
            Description,
        });

        user.Points += Amount;
        await user.save();

        res.json({ message: '포인트가 성공적으로 취소되었습니다.', newPoints });
    } catch (error) {
        console.error('포인트 취소 실패:', error);
        res.status(500).json({ message: '포인트 취소 실패', error });
    }
};


const searchPoints = async (req, res) => {
    const { loginID, chargeType, startDate, endDate, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    let whereCondition = {};

    console.log('Received query parameters:', { loginID, chargeType, startDate, endDate, page, limit });

    // 부분 일치 검색을 위해 LIKE 연산자 사용
    if (loginID) {
        try {
            const users = await User.findAll({
                where: { LoginID: { [Op.like]: `%${loginID}%` } },
                attributes: ['UserID'],
            });

            if (users.length > 0) {
                whereCondition.UserID = users.map((user) => user.UserID);
                console.log(
                    'User(s) found:',
                    users.map((user) => user.UserID)
                );
            } else {
                console.log('No user found with the provided LoginID');
                return res.json({ points: [], totalItems: 0, totalPages: 0 }); // 빈 배열, totalItems = 0, totalPages = 0 반환
            }
        } catch (error) {
            console.error('Error finding user by LoginID:', error);
            return res.status(500).json({ message: 'Error finding user by LoginID' });
        }
    }

    if (chargeType) {
        whereCondition.ChargeType = chargeType;
        console.log('ChargeType filter applied:', chargeType);
    }

    if (startDate && endDate) {
        whereCondition.ChargeDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
        console.log('Date range filter applied:', { startDate, endDate });
    }

    console.log('Final whereCondition:', whereCondition);

    try {
        // 전체 포인트 항목 수를 계산하여 totalItems와 totalPages를 얻기 위해 count() 사용
        const totalItems = await Points.count({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'], as: 'PointUser' }],
        });

        // 페이지네이션 적용된 포인트 내역 가져오기
        const points = await Points.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'], as: 'PointUser' }],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalPages = Math.ceil(totalItems / limit);

        console.log('Points found:', points.length, 'records');

        res.json({
            points,
            totalItems,
            totalPages,
            currentPage: parseInt(page),
        }); // 응답에 totalItems, totalPages, currentPage 추가
    } catch (error) {
        console.error('포인트 검색 실패:', error);
        res.status(500).json({ message: '포인트 검색 실패' });
    }
};




// 포인트 총 개수 가져오기
const getTotalPointsCount = async (req, res) => {
    try {
        const count = await Points.count(); // 총 개수 가져오기
        res.json({ count });
    } catch (error) {
        console.error('포인트 총 개수 가져오기 실패:', error);
        res.status(500).json({ message: '포인트 총 개수 가져오기 실패', error });
    }
};
module.exports = {
    getPointsHistory,
    updatePoints,
    cancelPoints,
    searchPoints,
    getTotalPointsCount,
};
