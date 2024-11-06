// controller/admin/InquiryController.js
const { Inquiries, InquiryReplies, User } = require('../../models');
const { Op } = require('sequelize');

const getInquiries = async (req, res) => {
    const {
        searchType,
        searchValue,
        startDate,
        endDate,
        status,
        inquiryType,
        page = 1,
        limit = 10,
        fetchTotalCount,
    } = req.query;

    console.log(req.query);

    let whereCondition = {};

    // 검색 조건을 설정
    if (searchType && searchValue) {
        if (searchType === 'UserId') {
            whereCondition.UserID = { [Op.like]: `%${searchValue}%` };
        } else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${searchValue}%` };
        } else if (searchType === 'Title') {
            whereCondition.Title = { [Op.like]: `%${searchValue}%` };
        }
    }

    if (startDate && endDate) {
        whereCondition.CreatedAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    if (status) {
        whereCondition.Status = status;
    }

    if (inquiryType) {
        whereCondition.InquiryType = inquiryType;
    }

    try {
        // 최초 로드 시 총 문의 수만 반환
        if (fetchTotalCount === 'true') {
            const totalCount = await Inquiries.count({ where: whereCondition });
            return res.json({ totalItems: totalCount });
        }

        // 페이지별 데이터 조회
        const offset = (page - 1) * limit;
        const { count, rows } = await Inquiries.findAndCountAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['InquiryID', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            inquiries: rows,
            totalItems: count,
            totalPages,
            currentPage: parseInt(page),
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
// 문의 검색 기능
const searchInquiries = async (req, res) => {
    const { searchType, searchValue, inquiryType, status, startDate, endDate } = req.query;

    let whereCondition = {};
    let userCondition = {};

    // 검색 조건 처리
    if (searchType && searchValue) {
        if (searchType === 'LoginID') {
            // LoginID 문자열 검색 조건 추가 (User 모델의 필드)
            userCondition.LoginID = { [Op.like]: `%${searchValue}%` };
        } else {
            // Inquiries 모델의 다른 필드 (예: Title, Content 등) 검색
            whereCondition[searchType] = { [Op.like]: `%${searchValue}%` };
        }
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
            include: [
                {
                    model: User,
                    attributes: ['LoginID'],
                    where: userCondition, // User 모델의 LoginID 조건 추가
                },
            ],
        });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: '문의 검색 실패' });
    }
};

module.exports = {
    getInquiries,
    createInquiry,
    replyToInquiry,
    getReply,
    searchInquiries,
};
