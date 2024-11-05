// controller/admin/NoticeController.js
const { Notice } = require('../../models');
const { Op } = require('sequelize');

// 공지사항 목록 조회 (페이지네이션 포함)
const getNotices = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Notice.findAndCountAll({
            order: [['PostDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            notices: rows,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        res.status(500).json({ message: '공지사항 목록 조회 실패' });
    }
};

// 공지사항 생성
const createNotice = async (req, res) => {
    const { title, content, postDate } = req.body;

    try {
        const newNotice = await Notice.create({
            Title: title,
            Content: content,
            PostDate: postDate,
        });
        res.status(201).json({ message: '공지사항이 성공적으로 생성되었습니다.', notice: newNotice });
    } catch (error) {
        console.error('공지사항 생성 실패:', error);
        res.status(500).json({ message: '공지사항 생성에 실패했습니다.' });
    }
};

// 공지사항 수정
const editNotice = async (req, res) => {
    const { noticeId } = req.params;
    const { title, content, postDate } = req.body;

    try {
        const notice = await Notice.findByPk(noticeId);
        if (!notice) {
            return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
        }

        await notice.update({
            Title: title,
            Content: content,
            PostDate: postDate,
        });

        res.json({ message: '공지사항이 성공적으로 수정되었습니다.', notice });
    } catch (error) {
        console.error('공지사항 수정 실패:', error);
        res.status(500).json({ message: '공지사항 수정에 실패했습니다.' });
    }
};

// 공지사항 삭제
const deleteNotice = async (req, res) => {
    const { noticeId } = req.params;

    try {
        const notice = await Notice.findByPk(noticeId);
        if (!notice) {
            return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
        }

        await notice.destroy();
        res.json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        res.status(500).json({ message: '공지사항 삭제에 실패했습니다.' });
    }
};

// 공지사항 검색
const searchNotices = async (req, res) => {
    const { query, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {};

    if (query) {
        whereCondition = {
            ...whereCondition,
            [Op.or]: [
                { Title: { [Op.like]: `%${query}%` } },
                { Content: { [Op.like]: `%${query}%` } },
            ],
        };
    }

    if (startDate && endDate) {
        whereCondition = {
            ...whereCondition,
            PostDate: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };
    }

    try {
        const { count, rows } = await Notice.findAndCountAll({
            where: whereCondition,
            order: [['PostDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            notices: rows,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('공지사항 검색 실패:', error);
        res.status(500).json({ message: '공지사항 검색에 실패했습니다.' });
    }
};


// 공지사항 총 개수 가져오기
const getTotalNoticesCount = async (req, res) => {
    try {
        const count = await Notice.count(); // 총 개수 가져오기
        res.json({ count });
    } catch (error) {
        console.error('공지사항 총 개수 가져오기 실패:', error);
        res.status(500).json({ message: '공지사항 총 개수 가져오기 실패', error });
    }
};

module.exports = {
    getNotices,
    createNotice,
    editNotice,
    deleteNotice,
    searchNotices,
    getTotalNoticesCount,
};
