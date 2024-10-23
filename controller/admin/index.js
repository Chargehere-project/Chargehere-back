const { User, Inquiries, InquiryReplies, Points } = require('../../models');
const { Op } = require('sequelize');

// 유저 검색 기능
const searchUsers = async (req, res) => {
    const { searchType, searchValue, startDate, endDate, status } = req.query;

    let whereCondition = {};

    if (searchType === 'name' && searchValue) {
        whereCondition.Name = { [Op.like]: `%${searchValue}%` };
    }

    if (searchType === 'id' && searchValue) {
        whereCondition.LoginID = { [Op.like]: `%${searchValue}%` };
    }

    if (startDate && endDate) {
        whereCondition.JoinDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    if (status) {
        whereCondition.Status = status;
    }

    try {
        const users = await User.findAll({ where: whereCondition });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '유저 검색 실패' });
    }
};

// 유저 전체 목록 가져오기 (페이지네이션 추가)
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // 기본값: 1페이지, 10개 항목
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await User.findAndCountAll({
            order: [['createdAt', 'DESC']], // 최신순 정렬
            limit: parseInt(limit), // 페이지당 항목 수
            offset: parseInt(offset), // 시작 인덱스
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            users: rows, // 현재 페이지의 유저 목록
            totalPages, // 전체 페이지 수
            currentPage: parseInt(page), // 현재 페이지
        });
    } catch (error) {
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

const getInquiries = async (req, res) => {
    const { searchType, searchValue, startDate, endDate, status, inquiryType, page = 1, limit = 10 } = req.query;

    let whereCondition = {}; // 검색 조건을 담을 객체

    // 회원 ID 또는 문의 내용으로 검색
    if (searchType && searchValue) {
        // 검색 유형이 'UserID'일 경우
        if (searchType === 'UserId') {
            whereCondition.UserID = { [Op.like]: `%${searchValue}%` };
        }
        // 검색 유형이 'Content'일 경우
        else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${searchValue}%` };
        }
        // 검색 유형이 'Title'일 경우
        else if (searchType === 'Title') {
            whereCondition.Title = { [Op.like]: `%${searchValue}%` };
        }
    }

    // 작성 기간 필터링 (startDate, endDate가 있을 경우)
    if (startDate && endDate) {
        whereCondition.CreatedAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // 문의 상태 필터링 (status가 있을 경우)
    if (status) {
        whereCondition.Status = status;
    }

    // 문의 유형 필터링 (inquiryType이 있을 경우)
    if (inquiryType) {
        whereCondition.InquiryType = inquiryType;
    }

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Inquiries.findAndCountAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }], // 회원 정보와 조인
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['InquiryID', 'DESC']], // 최신순 정렬
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            inquiries: rows, // 현재 페이지의 문의 목록
            totalItems: count, // 전체 문의 수
            totalPages, // 전체 페이지 수
            currentPage: parseInt(page), // 현재 페이지
        });
    } catch (error) {
        console.error('문의 목록 가져오기 실패:', error);
        res.status(500).json({ message: '문의 목록 가져오기 실패' });
    }
};

// 새로운 문의 생성 기능
const createInquiry = async (req, res) => {
    const { userId, title, content, inquiryType } = req.body;
    try {
        const newInquiry = await Inquiries.create({
            UserId: userId,
            Title: title,
            Content: content,
            InquiryType: inquiryType,
            Status: 'Pending',
            CreatedAt: new Date(),
        });
        res.json({ message: '문의가 성공적으로 생성되었습니다.', inquiry: newInquiry });
    } catch (error) {
        res.status(500).json({ message: '문의 생성 실패' });
    }
};

// 문의 답변 추가 또는 수정 기능
const replyToInquiry = async (req, res) => {
    const { inquiryId } = req.params;
    const { ReplyContent } = req.body;

    if (!ReplyContent) {
        return res.status(400).json({ message: 'ReplyContent is required' });
    }

    try {
        const inquiry = await Inquiries.findByPk(inquiryId);
        if (!inquiry) {
            return res.status(404).json({ message: '해당 문의를 찾을 수 없습니다.' });
        }

        let reply = await InquiryReplies.findOne({ where: { InquiryID: inquiryId } });

        if (reply) {
            // 기존 답변 수정
            reply.ReplyContent = ReplyContent;
            await reply.save();
        } else {
            // 새로운 답변 생성
            reply = await InquiryReplies.create({
                InquiryID: inquiryId,
                ReplyContent: ReplyContent,
                CreatedAt: new Date(),
            });
        }

        // 문의 상태를 '답변 완료'로 변경
        inquiry.Status = 'Answered';
        await inquiry.save();

        res.json({ message: '답변이 성공적으로 등록되었습니다.', reply });
    } catch (error) {
        res.status(500).json({ message: '답변 등록 실패' });
    }
};

// 특정 문의의 답변 가져오기
const getReply = async (req, res) => {
    const { inquiryId } = req.params;

    try {
        const reply = await InquiryReplies.findOne({ where: { InquiryID: inquiryId } });
        if (!reply) {
            return res.status(404).json({ message: '답변이 없습니다.' });
        }
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ message: '답변 조회 실패' });
    }
};

// 문의 검색 기능
const searchInquiries = async (req, res) => {
    const { searchType, searchValue, inquiryType, status, startDate, endDate } = req.query;

    let whereCondition = {};

    // 검색 조건 처리
    if (searchType && searchValue) {
        whereCondition[searchType] = { [Op.like]: `%${searchValue}%` }; // UserId, Title 등의 필드 검색 가능
    }

    if (inquiryType) {
        whereCondition.InquiryType = inquiryType; // 문의 유형 검색 (EV, Shop 등)
    }

    if (status) {
        whereCondition.Status = status; // 문의 상태 검색 (Pending, Answered 등)
    }

    if (startDate && endDate) {
        whereCondition.CreatedAt = { [Op.between]: [new Date(startDate), new Date(endDate)] }; // 작성 날짜 검색
    }

    try {
        const inquiries = await Inquiries.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }],
        });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: '문의 검색 실패' });
    }
};

// 포인트 내역 조회 기능 - 페이지네이션 적용
const getPointsHistory = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // 기본적으로 1페이지, 10개씩 가져오기
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Points.findAndCountAll({
            include: [{ model: User, attributes: ['LoginID'] }], // 유저 정보 포함
            order: [['createdAt', 'DESC']], // 최신순 정렬
            limit: parseInt(limit), // 페이지당 가져올 데이터 수
            offset: parseInt(offset), // 페이지 시작점
        });

        res.json({
            totalItems: count, // 전체 데이터 개수
            totalPages: Math.ceil(count / limit), // 전체 페이지 수
            currentPage: page, // 현재 페이지
            points: rows, // 현재 페이지 데이터
        });
    } catch (error) {
        res.status(500).json({ message: '포인트 내역 조회 실패', error });
    }
};

// 포인트 추가/차감 기능
const updatePoints = async (req, res) => {
    const { userID, Amount, Description } = req.body;

    // 로그로 데이터 확인
    console.log('포인트 변경 요청:', { userID, Amount, Description });

    try {
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        const newPoints = await Points.create({
            UserID: userID,
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: Amount > 0 ? 'Earned' : 'Deducted',
            Amount: Amount,
            Description: Description,
        });

        // 유저 포인트 업데이트
        user.Points += Amount;
        await user.save();

        console.log('포인트 업데이트 성공:', newPoints);
        res.json({ message: '포인트가 성공적으로 변경되었습니다.', newPoints });
    } catch (error) {
        console.error('포인트 변경 실패:', error);
        res.status(500).json({ message: '포인트 변경 실패', error });
    }
};

// 포인트 취소 기능
const cancelPoints = async (req, res) => {
    const { pointID, userID, Amount, Description } = req.body;

    try {
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        // 취소로 인해 새 포인트 항목을 추가
        const newPoints = await Points.create({
            UserID: userID,
            TransactionID: null,
            ChargeDate: new Date(),
            ChargeType: 'Deducted',
            Amount: Amount, // 차감 금액
            Description: Description, // 취소로 인한 차감 이유
        });

        // 유저 포인트 업데이트
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
    const { userId, chargeType, minAmount, maxAmount, startDate, endDate } = req.query;

    // 검색 조건을 담을 객체
    let whereCondition = {};

    // 회원 아이디로 검색
    if (userId) {
        whereCondition.UserID = { [Op.like]: `%${userId}%` };
    }

    // 포인트 변경 유형으로 검색
    if (chargeType) {
        whereCondition.ChargeType = chargeType;
    }

    // 적립 금액 범위로 검색
    if (minAmount && maxAmount) {
        whereCondition.Amount = {
            [Op.between]: [minAmount, maxAmount],
        };
    }

    // 적립 날짜 범위로 검색
    if (startDate && endDate) {
        whereCondition.ChargeDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    try {
        // 조건에 맞는 포인트 내역 가져오기
        const points = await Points.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }], // 회원 정보와 조인
        });
        res.json(points); // 결과 반환
    } catch (error) {
        console.error('포인트 검색 실패:', error);
        res.status(500).json({ message: '포인트 검색 실패' });
    }
};

module.exports = {
    searchUsers,
    getAllUsers,
    updateUserStatus,
    updateUser,
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries,
    getPointsHistory, // 포인트 내역 조회 추가
    updatePoints, // 포인트 변경 기능 추가
    cancelPoints,
    searchPoints,
};
