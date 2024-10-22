const { User, Inquiries, InquiryReplies } = require('../../models');
const { Op } = require('sequelize');

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

// 유저 전체 목록 가져오기
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '유저 목록 가져오기 실패' });
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

// 모든 문의 조회 기능 + 검색 기능 추가
const getInquiries = async (req, res) => {
    const { searchType, searchValue, startDate, endDate, status, inquiryType } = req.query;

    let whereCondition = {}; // 검색 조건을 담을 객체

    // 회원 ID 또는 문의 내용으로 검색
    if (searchType && searchValue) {
        if (searchType === 'UserId') {
            whereCondition.UserId = { [Op.like]: `%${searchValue}%` }; // 회원 ID 검색
        } else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${searchValue}%` }; // 문의 내용 검색
        }
    }

    // 작성 기간 필터링 (startDate, endDate가 있을 경우)
    if (startDate && endDate) {
        whereCondition.CreatedAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    // 문의 상태 필터링 (status가 있을 경우)
    if (status) {
        whereCondition.Status = status; // Pending, Answered 등
    }

    // 문의 유형 필터링 (inquiryType이 있을 경우)
    if (inquiryType) {
        whereCondition.InquiryType = inquiryType; // 전기차, 쇼핑몰 등
    }

    try {
        // 검색 조건을 기반으로 문의 목록 가져오기
        const inquiries = await Inquiries.findAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }], // 회원 정보와 조인
        });
        res.json(inquiries);
    } catch (error) {
        console.error('문의 목록 가져오기 실패:', error); // 에러 로그 출력
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


module.exports = {
    signup,
    login,
    searchUsers,
    getAllUsers,
    updateUserStatus,
    updateUser,
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries,
};