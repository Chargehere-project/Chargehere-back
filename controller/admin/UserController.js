// controller/admin/UserController.js
const { User } = require('../../models');
const { Op } = require('sequelize');

// 유저 검색 기능
const searchUsers = async (req, res) => {
    const { searchType, searchValue, startDate, endDate, status, forCouponIssue } = req.query;

    let whereCondition = {};

    if (searchType === 'name' && searchValue) {
        whereCondition.Name = { [Op.like]: `%${searchValue}%` };
        console.log('이름 필터 적용:', whereCondition.Name);
    }

    if (searchType === 'id' && searchValue) {
        whereCondition.LoginID = { [Op.like]: `%${searchValue}%` };
        console.log('아이디 필터 적용:', whereCondition.LoginID);
    }

    if (startDate && endDate) {
        whereCondition.JoinDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
        console.log('날짜 필터 적용:', whereCondition.JoinDate);
    }

    if (status) {
        whereCondition.Status = status;
        console.log('상태 필터 적용:', whereCondition.Status);
    }

    if (forCouponIssue) {
        whereCondition.isCouponEligible = true; // 쿠폰 발급 가능한 유저 필터
    }

    // 필터 조건 로그 출력
    console.log('생성된 필터 조건:', whereCondition);

    try {
        const users = await User.findAll({ where: whereCondition });
        console.log('필터 적용 후 검색된 유저들:', users);
        res.json(users);
    } catch (error) {
        console.error('유저 검색 실패:', error);
        res.status(500).json({ message: '유저 검색 실패' });
    }
};




// 유저 전체 목록 가져오기 (페이지네이션 추가)
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // 기본값: 1페이지, 10개 항목

    // limit가 "all"로 설정된 경우 모든 유저를 가져오기 위해 limit과 offset을 무시합니다.
    const offset = limit === 'all' ? 0 : (page - 1) * limit;
    const actualLimit = limit === 'all' ? null : parseInt(limit); // "all"이면 제한 없음

    try {
        const { count, rows } = await User.findAndCountAll({
            order: [['UserID', 'DESC']], // 최신순 정렬
            limit: actualLimit, // 페이지당 항목 수 또는 모든 유저
            offset, // 시작 인덱스
        });

        const totalPages = limit === 'all' ? 1 : Math.ceil(count / limit); // 모든 유저를 불러오면 페이지 수는 1

        res.json({
            users: rows, // 현재 페이지의 유저 목록 또는 전체 유저
            totalPages, // 전체 페이지 수
            currentPage: parseInt(page), // 현재 페이지
        });
    } catch (error) {
        console.error('유저 목록 가져오기 실패:', error);
        res.status(500).json({ message: '유저 목록 가져오기 실패', error });
    }
};


// 유저 상태 업데이트
const updateUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        user.Status = status;
        await user.save();
        res.json({ message: '유저 상태가 업데이트되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '유저 상태 업데이트 실패' });
    }
};

// 유저 정보 수정
const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { Name, Password, Points, PhoneNumber, Address } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        user.Name = Name;
        if (Password) user.Password = Password; // 비밀번호는 비워져 있지 않으면 수정
        user.Points = Points;
        user.PhoneNumber = PhoneNumber;
        user.Address = Address;

        await user.save();
        res.json({ message: '유저 정보가 업데이트되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '유저 정보 업데이트 실패' });
    }
};
module.exports = {
    searchUsers,
    getAllUsers,
    updateUserStatus,
    updateUser,
};
