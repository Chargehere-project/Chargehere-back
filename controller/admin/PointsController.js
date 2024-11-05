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


// 포인트 검색 기능
const searchPoints = async (req, res) => {
    const { loginID, chargeType, startDate, endDate } = req.query;

    let whereCondition = {};

    // LoginID로 검색할 경우 User 테이블에서 UserID를 조회하여 필터링
    if (loginID) {
        const user = await User.findOne({ where: { LoginID: loginID } });
        if (user) {
            whereCondition.UserID = user.UserID; // UserID로 필터링
        } else {
            return res.json([]); // 유저가 없으면 빈 배열 반환
        }
    }

    if (chargeType) {
        whereCondition.ChargeType = chargeType;
    }

    if (startDate && endDate) {
        whereCondition.ChargeDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    try {
        const points = await Points.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'], as: 'PointUser' }], // User alias 포함
        });
        res.json(points);
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
