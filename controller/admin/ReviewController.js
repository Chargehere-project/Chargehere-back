// controller/admin/ReviewController.js
const { Reviews, User, Products } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 리뷰 데이터 가져오기 (페이지네이션 적용)
const getReviews = async (req, res) => {
    const { page = 1, limit = 5 } = req.query; // 페이지당 5개 리뷰로 설정
    const offset = (page - 1) * limit;

    try {
        // 전체 리뷰 개수 가져오기
        const totalReviews = await Reviews.count();

        // 리뷰 데이터와 사용자, 제품 정보 포함 조회
        const { count, rows } = await Reviews.findAndCountAll({
            include: [
                { model: User, attributes: ['LoginID'] },
                { model: Products, attributes: ['ProductName'] },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ReviewDate', 'DESC']], // 최신순 정렬
        });

        // 리뷰 데이터를 서울 시간대에 맞게 포맷팅
        const formattedReviews = rows.map((review) => ({
            ...review.toJSON(),
            ReviewDate: new Date(review.ReviewDate).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false, // 24시간 형식 사용
                timeZone: 'Asia/Seoul',
            }), // 서울 시간 기준
        }));

        // 페이지 수 계산
        const totalPages = Math.ceil(count / limit);

        res.json({
            reviews: formattedReviews,
            totalPages,
            currentPage: parseInt(page),
            totalReviews, // 총 리뷰 개수 추가
        });
    } catch (error) {
        console.error('리뷰 목록 가져오기 실패:', error.message);
        res.status(500).json({ message: '리뷰 목록 가져오기 실패', error: error.message });
    }
};



// 리뷰 수정
const editReview = async (req, res) => {
    const { reviewId } = req.params;
    const { Content, Rating } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const review = await Reviews.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: '해당 리뷰를 찾을 수 없습니다.' });
        }

        review.Content = Content || review.Content;
        review.Rating = Rating || review.Rating;

        // 이미지가 새로 업로드된 경우에만 업데이트
        if (image) {
            // 이전 이미지가 있으면 삭제
            if (review.Image) {
                const previousImagePath = path.join(__dirname, '../../uploads', review.Image.replace('/uploads/', ''));
                fs.unlink(previousImagePath, (err) => {
                    if (err) {
                        console.error('이전 이미지 삭제 실패:', err);
                    }
                });
            }
            review.Image = image; // 새 이미지로 업데이트
        }

        await review.save();
        res.json({ message: '리뷰가 성공적으로 수정되었습니다.', review });
    } catch (error) {
        console.error('리뷰 수정 실패:', error);
        res.status(500).json({ message: '리뷰 수정에 실패했습니다.', error });
    }
};


// 리뷰 삭제 (상태를 'deleted'로 변경)
const deleteReview = async (req, res) => {
    console.log('DELETE request received for review ID:', req.params.reviewId);

    const { reviewId } = req.params;
    try {
        const review = await Reviews.findByPk(reviewId);
        if (!review) {
            console.log('Review not found for ID:', reviewId);
            return res.status(404).json({ message: '해당 리뷰를 찾을 수 없습니다.' });
        }

        review.Status = 'deleted';
        await review.save();
        res.json({ message: '리뷰가 삭제되었습니다.', review });
    } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        res.status(500).json({ message: '리뷰 삭제 실패', error });
    }
};



const updateReviewStatus = async (req, res) => {
    const { reviewId } = req.params;
    const { status } = req.body;
    console.log(`Received request to update status for review ID: ${reviewId} to ${status}`);

    try {
        const review = await Reviews.findByPk(reviewId);
        if (!review) {
            console.log('Review not found');
            return res.status(404).json({ message: '해당 리뷰를 찾을 수 없습니다.' });
        }

        review.Status = status;
        await review.save();
        console.log('Review status successfully updated to:', review.Status);

        res.json({ message: '리뷰 상태가 성공적으로 업데이트되었습니다.', review });
    } catch (error) {
        console.error('리뷰 상태 업데이트 실패:', error);
        res.status(500).json({ message: '리뷰 상태 업데이트 실패', error });
    }
};


// 리뷰 이미지 삭제 함수
const deleteReviewImage = async (req, res) => {
    console.log('deleteReviewImage 함수 호출됨:', req.params.reviewId);
    try {
        const { reviewId } = req.params;
        const review = await Reviews.findByPk(reviewId);

        if (!review || !review.Image) {
            return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
        }

        // 이미지 경로 설정
        const imagePath = path.join(__dirname, '../../uploads', review.Image.replace('/uploads/', ''));

        // 파일 삭제
        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('파일 삭제 실패:', err);
                return res.status(500).json({ message: '이미지 삭제에 실패했습니다.' });
            }

            // DB에서 이미지 경로 제거
            review.Image = null;
            await review.save();

            res.json({ message: '이미지가 성공적으로 삭제되었습니다.' });
        });
    } catch (error) {
        console.error('이미지 삭제 오류:', error);
        if (!res.headersSent) { // 이미 응답을 보냈는지 확인
            res.status(500).json({ message: '이미지 삭제 오류가 발생했습니다.' });
        }
    }
};

// const searchReviews = async (req, res) => {
//     const { searchType, searchValue, status, startDate, endDate, page = 1, limit = 10 } = req.query;

//     // 검색 조건을 설정할 where 조건 객체
//     let whereCondition = {};

//     // 검색 유형에 따라 검색 조건 추가 (리뷰 ID, 회원 ID, 리뷰 내용 등)
//     if (searchType && searchValue) {
//         if (searchType === 'ReviewID') {
//             whereCondition.ReviewID = { [Op.like]: `%${searchValue}%` };
//         } else if (searchType === 'UserID') {
//             whereCondition.UserID = { [Op.like]: `%${searchValue}%` };
//         } else if (searchType === 'Content') {
//             whereCondition.Content = { [Op.like]: `%${searchValue}%` };
//         }
//     }

//     // 상태 필터 (visible 또는 hidden)
//     if (status) {
//         whereCondition.Status = status;
//     }

//     // 리뷰 날짜 범위 필터
//     if (startDate && endDate) {
//         whereCondition.ReviewDate = {
//             [Op.between]: [new Date(startDate), new Date(endDate)],
//         };
//     }

//     const offset = (page - 1) * limit;

//     try {
//         // 필터된 리뷰 데이터와 전체 리뷰 수를 가져옵니다.
//         const { count, rows } = await Reviews.findAndCountAll({
//             where: whereCondition,
//             include: [
//                 { model: User, attributes: ['LoginID'] }, // 회원 정보 포함
//                 { model: Products, attributes: ['ProductName'] }, // 상품 정보 포함
//             ],
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             order: [['ReviewDate', 'DESC']], // 최신순 정렬
//         });

//         const totalPages = Math.ceil(count / limit);

//         res.json({
//             reviews: rows, // 현재 페이지의 리뷰 목록
//             totalPages, // 전체 페이지 수
//             currentPage: parseInt(page), // 현재 페이지
//         });
//     } catch (error) {
//         console.error('리뷰 검색 실패:', error);
//         res.status(500).json({ message: '리뷰 검색 실패', error });
//     }
// };

const searchReviews = async (req, res) => {
    const { searchType, query, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let whereCondition = {};
    let includeOptions = [
        { model: User, attributes: ['LoginID'] },
        { model: Products, attributes: ['ProductName'] },
    ];

    console.log('Received search parameters:', req.query); // 디버깅용

    // 검색 유형에 따라 검색 조건 추가 (리뷰 ID, 회원 ID, 리뷰 내용 등)
    if (searchType && query) {
        if (searchType === 'ReviewID') {
            whereCondition.ReviewID = { [Op.like]: `%${query}%` };
        } else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${query}%` };
        } else if (searchType === 'UserID') {
            // User 테이블의 LoginID를 조건으로 추가
            includeOptions[0].where = { LoginID: { [Op.like]: `%${query}%` } };
        }
        console.log('Applied search type and value:', { searchType, query, whereCondition }); // 디버깅용
    }

    // 상태 필터 추가
    if (status) {
        whereCondition.Status = status;
        console.log('Applied status filter:', status); // 디버깅용
    }

    // 날짜 범위 필터 추가
    if (startDate && endDate) {
        whereCondition.ReviewDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
        console.log('Applied date range filter:', { startDate, endDate }); // 디버깅용
    }

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Reviews.findAndCountAll({
            where: whereCondition,
            include: includeOptions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ReviewDate', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        console.log('Search results:', { count, reviews: rows.map((row) => row.dataValues) }); // 디버깅용

        res.json({
            reviews: rows,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('리뷰 검색 실패:', error);
        res.status(500).json({ message: '리뷰 검색 실패', error });
    }
};


module.exports = {
    getReviews,
    editReview,
    deleteReview,
    updateReviewStatus,
    deleteReviewImage,
    searchReviews,
};
