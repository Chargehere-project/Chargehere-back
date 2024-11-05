// controller/admin/QnAController.js
const { QnA, QnAReplies, User } = require('../../models');
const { Op } = require('sequelize');

// QnA 전체 목록 가져오기 (페이지네이션 포함)
const getQnAs = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await QnA.findAndCountAll({
            include: [{ model: User, attributes: ['LoginID'] }], // 유저 정보 포함
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['QnAID', 'DESC']], // 최신순 정렬
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            qna: rows,
            totalPages,
            currentPage: parseInt(page),
            totalQnAs: count, // 총 QnA 개수 추가
        });
    } catch (error) {
        console.error('QnA 목록 가져오기 실패:', error);
        res.status(500).json({ message: 'QnA 목록 가져오기 실패' });
    }
};


// 특정 QnA 답변 가져오기
const getQnAReply = async (req, res) => {
    const { qnaId } = req.params;

    try {
        const reply = await QnAReplies.findOne({ where: { QnAID: qnaId } });
        if (!reply) {
            return res.status(404).json({ message: '답변이 없습니다.' });
        }
        res.json({ reply });
    } catch (error) {
        console.error('답변 조회 실패:', error);
        res.status(500).json({ message: '답변 조회 실패' });
    }
};

// QnA 답변 추가 또는 수정
const replyToQnA = async (req, res) => {
    const { qnaId } = req.params;
    const { ReplyContent, ProductID } = req.body; // ProductID를 요청 본문에서 가져옵니다.

    try {
        const qna = await QnA.findByPk(qnaId);
        if (!qna) {
            return res.status(404).json({ message: '해당 QnA를 찾을 수 없습니다.' });
        }

        let reply = await QnAReplies.findOne({ where: { QnAID: qnaId } });
        if (reply) {
            // 기존 답변 수정
            reply.ReplyContent = ReplyContent;
            await reply.save();
        } else {
            // 새로운 답변 생성, ProductID를 포함하여 생성
            reply = await QnAReplies.create({
                QnAID: qnaId,
                ReplyContent,
                ProductID, // ProductID를 추가하여 생성
                CreatedAt: new Date(),
            });
        }

        // QnA 상태를 '답변 완료'로 변경
        qna.Status = 'Answered';
        await qna.save();

        res.json({ message: '답변이 성공적으로 등록되었습니다.', reply });
    } catch (error) {
        console.error('답변 등록 실패:', error);
        res.status(500).json({ message: '답변 등록 실패' });
    }
};


// QnA 검색 기능
// const searchQnAs = async (req, res) => {
//     const { searchType, query, status, startDate, endDate, page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;
//     let whereCondition = {};

//     // 검색 조건 설정
//     if (searchType && query) {
//         if (searchType === 'UserID') {
//             whereCondition.UserID = { [Op.like]: `%${query}%` };
//         } else if (searchType === 'Title') {
//             whereCondition.Title = { [Op.like]: `%${query}%` };
//         } else if (searchType === 'Content') {
//             whereCondition.Content = { [Op.like]: `%${query}%` };
//         }
//     }

//     if (status) {
//         whereCondition.Status = status;
//     }

//     if (startDate && endDate) {
//         whereCondition.CreatedAt = {
//             [Op.between]: [new Date(startDate), new Date(endDate)],
//         };
//     }

//     try {
//         const { count, rows } = await QnA.findAndCountAll({
//             where: whereCondition,
//             include: [{ model: User, attributes: ['LoginID'] }],
//             limit: parseInt(limit),
//             offset,
//             order: [['QnAID', 'DESC']],
//         });

//         const totalPages = Math.ceil(count / limit);

//         res.json({
//             qnas: rows,
//             totalPages,
//             currentPage: parseInt(page),
//         });
//     } catch (error) {
//         console.error('QnA 검색 실패:', error);
//         res.status(500).json({ message: 'QnA 검색 실패' });
//     }
// };

const searchQnAs = async (req, res) => {
    console.log('searchQnAs function called');
    const { searchType, query, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let whereCondition = {};

    // 검색 조건 설정
    if (searchType && query) {
        if (searchType === 'UserID') {
            whereCondition.UserID = { [Op.like]: `%${query}%` };
        } else if (searchType === 'Title') {
            whereCondition.Title = { [Op.like]: `%${query}%` };
        } else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${query}%` };
        }
    }

    if (status) {
        whereCondition.Status = status;
    }

    // 날짜 필터링 설정
    if (startDate && endDate) {
        
        console.log('Date range:', new Date(startDate), new Date(endDate)); // 날짜 필터 디버깅 로그
        whereCondition.CreatedAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
        
    }

    try {
        const { count, rows } = await QnA.findAndCountAll({
            where: whereCondition,
            include: [{ model: User, attributes: ['LoginID'] }],
            limit: parseInt(limit),
            offset,
            order: [['QnAID', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            qnas: rows,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('QnA 검색 실패:', error);
        res.status(500).json({ message: 'QnA 검색 실패' });
    }
};

module.exports = {
    getQnAs,
    getQnAReply,
    replyToQnA,
    searchQnAs,
};
