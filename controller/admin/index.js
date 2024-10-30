const { User, Inquiries, InquiryReplies, Points, Coupons, UserCoupon, Products, Reviews, QnA, QnAReplies } = require('../../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');  // Sequelize 모듈을 가져옵니다.
const fs = require('fs');
const path = require('path'); 
const moment = require('moment-timezone');


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
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await User.findAndCountAll({
            order: [['createdAt', 'DESC']], // 최신순 정렬
            limit: parseInt(limit), // 페이지당 항목 수
            offset: parseInt(offset), // 시작 인덱스
            order: [['UserID', 'DESC']], // 최신순 정렬
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




// 새로운 쿠폰 생성
// 쿠폰 생성 로직
const createCoupon = async (req, res) => {
    const { couponId, name, discountAmount, startDate, expiry, status } = req.body;

    try {
        // 쿠폰 ID 중복 확인
        const existingCouponId = await Coupons.findOne({ where: { CouponID: couponId } });
        if (existingCouponId) {
            return res.status(400).json({ message: '중복된 쿠폰 ID가 있습니다.' });
        }

        const newCoupon = await Coupons.create({
            CouponID: couponId,
            CouponName: name,
            DiscountAmount: discountAmount,
            StartDate: new Date(startDate),
            ExpirationDate: new Date(expiry),
            Status: status
        });

        res.json({ message: '쿠폰이 성공적으로 생성되었습니다.', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: '쿠폰 생성 실패', error });
    }
};






// 사용자에게 쿠폰 발급 또는 사용 시 유효기간 확인 로직 추가
// const issueCoupon = async (req, res) => {
//     const { userID, couponID } = req.body;

//     try {
//         // 쿠폰 정보를 조회
//         const coupon = await Coupons.findByPk(couponID);
//         if (!coupon) {
//             return res.status(404).json({ message: '해당 쿠폰을 찾을 수 없습니다.' });
//         }

//         // 현재 날짜와 쿠폰 유효기간 비교
//         const now = new Date();
//         const expirationDate = new Date(coupon.ExpirationDate);

//         // 쿠폰이 만료된 경우
//         if (now > expirationDate) {
//             return res.status(400).json({ message: '이 쿠폰은 유효기간이 만료되었습니다.' });
//         }

//         // 유저 조회
//         const user = await User.findByPk(userID);
//         if (!user) {
//             return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
//         }

//         // 쿠폰 발급 처리
//         const issuedCoupon = await UserCoupon.create({
//             UserID: userID,
//             CouponID: couponID,
//             IssuedAt: now,
//             IsUsed: false,
//         });

//         res.json({ message: '쿠폰이 성공적으로 발급되었습니다.', userCoupon: issuedCoupon });
//     } catch (error) {
//         res.status(500).json({ message: '쿠폰 발급 실패', error });
//     }
// };

const issueCoupon = async (req, res) => {
    const { loginID, couponID } = req.body;

    if (!loginID || !couponID) {
        return res.status(400).json({ message: '유저 ID와 쿠폰 ID가 필요합니다.' });
    }

    try {
        const coupon = await Coupons.findByPk(couponID);
        if (!coupon) {
            return res.status(404).json({ message: '해당 쿠폰을 찾을 수 없습니다.' });
        }

        const now = new Date();
        const expirationDate = new Date(coupon.ExpirationDate);

        if (now > expirationDate) {
            return res.status(400).json({ message: '이 쿠폰은 유효기간이 만료되었습니다.' });
        }

        const user = await User.findOne({ where: { LoginID: loginID } });
        if (!user) {
            return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
        }

        const issuedCoupon = await UserCoupon.create({
            UserID: user.UserID, // user의 UserID를 사용
            CouponID: couponID,
            IssuedAt: now,
            IsUsed: false,
        });

        res.json({ message: '쿠폰이 성공적으로 발급되었습니다.', userCoupon: issuedCoupon });
    } catch (error) {
        console.error('쿠폰 발급 실패:', error);
        res.status(500).json({ message: '쿠폰 발급 실패', error });
    }
};



// 쿠폰 리스트 조회
const getCoupons = async (req, res) => {
    const { page = 1, limit = 10, name, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {};

    // 쿠폰명으로 검색
    if (name) {
        whereCondition.CouponName = { [Op.like]: `%${name}%` };
    }

    // 상태 필터링 (active, expired, deleted 등)
    if (status) {
        whereCondition.Status = status;
    }

    // 시작일과 종료일 범위 필터링
    if (startDate && endDate) {
        whereCondition.StartDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    try {
        const { count, rows } = await Coupons.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: UserCoupon,
                    attributes: ['IsUsed'],
                    as: 'UserCoupons', // 설정한 별칭 추가
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']], // 최신순 정렬
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            coupons: rows,
        });
    } catch (error) {
        console.error('쿠폰 목록 조회 실패:', error);
        res.status(500).json({ message: '쿠폰 목록 조회 실패', error });
    }
};





// 특정 쿠폰 수정
const editCoupon = async (req, res) => {
    const { couponID } = req.params; // 요청 경로에서 couponID 가져옴
    const { name, discountAmount, startDate, expiry, status } = req.body; // 요청 본문에서 수정할 내용 가져옴

    try {
        // 쿠폰ID로 해당 쿠폰 찾기
        const coupon = await Coupons.findByPk(couponID);
        if (!coupon) {
            return res.status(404).json({ message: '해당 쿠폰을 찾을 수 없습니다.' });
        }

        // 쿠폰 정보 업데이트
        coupon.CouponName = name;
        coupon.DiscountAmount = discountAmount;
        coupon.StartDate = new Date(startDate);
        coupon.ExpirationDate = new Date(expiry);
        coupon.Status = status; // 상태 업데이트

        await coupon.save(); // 수정된 쿠폰 정보 저장

        res.json({ message: '쿠폰이 성공적으로 수정되었습니다.', coupon });
    } catch (error) {
        console.error('쿠폰 수정 실패:', error.message); // 오류 로그 출력
        res.status(500).json({ message: '쿠폰 수정 실패', error: error.message });
    }
};


// 발급된 쿠폰 조회
const getIssuedCoupons = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await UserCoupon.findAndCountAll({
            include: [
                { model: User, attributes: ['LoginID', 'Name'], as: 'UserDetail' }, // User 모델의 별칭을 UserDetail로 설정
                { model: Coupons, attributes: ['CouponName'], as: 'Coupon' }, // Coupons 모델의 별칭 설정
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[Sequelize.literal('CASE WHEN `IsUsed` = 1 THEN `UsedAt` ELSE `IssuedAt` END'), 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            issuedCoupons: rows,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('쿠폰 사용 목록 조회 실패:', error.message);
        res.status(500).json({ message: '발급된 쿠폰 목록 조회 실패', error });
    }
};



// 백엔드 쿠폰 상태 업데이트 컨트롤러
// 쿠폰 상태 업데이트 컨트롤러 (findByPk와 save 사용)
const updateCouponStatus = async (req, res) => {
    const { id } = req.params; // 요청 경로에서 쿠폰 ID 가져옴
    const { status } = req.body; // 요청 본문에서 변경할 상태값 가져옴

    try {
        // 쿠폰 ID로 해당 쿠폰 찾기
        const coupon = await Coupons.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: '쿠폰을 찾을 수 없습니다.' });
        }

        // 쿠폰 상태 업데이트
        coupon.Status = status;

        // 변경 사항 저장
        await coupon.save();

        console.log("쿠폰 상태가 성공적으로 업데이트되었습니다:", coupon.Status);
        res.json({ message: '쿠폰 상태가 성공적으로 업데이트되었습니다.', coupon });
    } catch (error) {
        console.error('쿠폰 상태 업데이트 실패:', error.stack); // 전체 오류 스택 출력
        res.status(500).json({ message: '쿠폰 상태 업데이트 실패', error });
    }
};

// 쿠폰 검색 기능
const searchCoupons = async (req, res) => {
    const { couponId, startDate, endDate, searchBy, searchQuery } = req.query;

    let whereCondition = {};

    if (couponId) {
        whereCondition.CouponID = parseInt(couponId, 10);
    }

    if (startDate && endDate) {
        whereCondition.IssuedAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    if (searchBy === 'LoginID' && searchQuery) {
        whereCondition['$UserDetail.LoginID$'] = { [Op.like]: `%${searchQuery}%` };
    } else if (searchBy === 'userName' && searchQuery) {
        whereCondition['$UserDetail.Name$'] = { [Op.like]: `%${searchQuery}%` };
    }

    try {
        const coupons = await UserCoupon.findAll({
            where: whereCondition,
            include: [
                { model: Coupons, attributes: ['CouponName'] },
                { model: User, as: 'UserDetail', attributes: ['LoginID', 'Name'] },
            ],
            order: [['IssuedAt', 'DESC']],
        });

        res.json(coupons);
    } catch (error) {
        console.error('쿠폰 검색 실패:', error);
        res.status(500).json({ message: '쿠폰 검색 실패' });
    }
};





// 상품 목록 조회 기능 - 페이지네이션 적용
const getProducts = async (req, res) => {
    const { page = 1, limit = 10, name, status, categoryId } = req.query; // 페이지, 제한 수, 이름, 상태, 카테고리ID 필터를 쿼리에서 가져옵니다.
    const offset = (page - 1) * limit;

    // where 조건을 초기화합니다.
    let whereCondition = {};

    // 상품명으로 검색
    if (name) {
        whereCondition.ProductName = { [Op.like]: `%${name}%` };
    }

    // 상태 필터링 (active, inactive, deleted 등)
    if (status) {
        whereCondition.Status = status;
    }

    // 카테고리 ID 필터링
    if (categoryId) {
        whereCondition.CategoryID = categoryId;
    }

    try {
        // 상품 목록과 전체 개수를 조회합니다.
        const { count, rows } = await Products.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']], // 최신순 정렬
        });

        const totalPages = Math.ceil(count / limit); // 전체 페이지 수 계산

        res.json({
            products: rows, // 현재 페이지의 상품 목록
            totalPages, // 전체 페이지 수
            currentPage: parseInt(page), // 현재 페이지
        });
    } catch (error) {
        console.error('상품 목록 조회 실패:', error.message);
        res.status(500).json({ message: '상품 목록 조회 실패', error: error.message });
    }
};

// 상품 등록
const createProduct = async (req, res) => {
    const { name, price, discountRate, description, status, categoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // 파일이 있을 경우 경로 지정

    try {
        const newProduct = await Products.create({
            ProductName: name,
            Price: price,
            Discount: discountRate,
            Image: image, // 이미지 경로 설정
            DetailInfo: description,
            CategoryID: categoryId,
            Status: status || 'active', // 기본 상태는 'active'
        });
        res.json({ message: '상품이 성공적으로 등록되었습니다.', product: newProduct });
    } catch (error) {
        console.error('상품 등록 실패:', error);
        res.status(500).json({ message: '상품 등록에 실패했습니다.', error });
    }
};


// 상품 수정
const editProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, price, discountRate, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.ProductName = name;
        product.Price = price;
        product.Discount = discountRate;
        product.DetailInfo = description;
        product.Status = status;

        // 이미지가 새로 업로드된 경우에만 업데이트
        if (image) {
            product.Image = image;
        }

        await product.save();
        res.json({ message: '상품이 성공적으로 수정되었습니다.', product });
    } catch (error) {
        console.error('상품 수정 실패:', error);
        res.status(500).json({ message: '상품 수정에 실패했습니다.', error });
    }
};






// 상품 삭제
const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.Status = 'deleted'; // '삭제됨' 상태로 변경
        await product.save();

        res.json({ message: '상품이 삭제되었습니다.', product });
    } catch (error) {
        console.error('상품 삭제 실패:', error);
        res.status(500).json({ message: '상품 삭제에 실패했습니다.', error });
    }
};

// 상태 변경
const updateProductStatus = async (req, res) => {
    const { productId } = req.params;
    const { status } = req.body;

    console.log(`상태 변경 요청 - ProductID: ${productId}, Status: ${status}`); // 디버깅 코드

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            console.log('상품을 찾을 수 없습니다.');
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.Status = status;
        await product.save();

        console.log('상태가 성공적으로 변경되었습니다:', product.Status); // 디버깅 코드
        res.json({ message: '상태가 성공적으로 변경되었습니다.', product });
    } catch (error) {
        console.error('상태 변경 실패:', error); // 디버깅 코드
        res.status(500).json({ message: '상태 변경에 실패했습니다.', error });
    }
};

// 상품 이미지 삭제 함수
const deleteProductImage = async (req, res) => {
    console.log('deleteProductImage 함수 호출됨:', req.params.productId);
    try {
        const { productId } = req.params;
        const product = await Products.findByPk(productId);

        if (!product || !product.Image) {
            return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
        }

        // 경로 수정: 중복된 uploads 폴더 제거
        const imagePath = path.join(__dirname, '../../uploads', product.Image.replace('/uploads/', ''));

        // 파일 삭제
        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('파일 삭제 실패:', err);
                return res.status(500).json({ message: '이미지 삭제에 실패했습니다.' });
            }

            // DB에서 이미지 경로 제거
            product.Image = null;
            await product.save();

            res.json({ message: '이미지가 성공적으로 삭제되었습니다.' });
        });
    } catch (error) {
        console.error('이미지 삭제 오류:', error);
        if (!res.headersSent) { // 이미 응답을 보냈는지 확인
            res.status(500).json({ message: '이미지 삭제 오류가 발생했습니다.' });
        }
    }
};

// const convertToKST = (utcDate) => {
//     const date = new Date(utcDate);
//     date.setHours(date.getHours() + 9); // UTC에서 KST로 변환
//     return date.toISOString().replace('T', ' ').substring(0, 19);
// };

const searchProducts = async (req, res) => {
    const { productId, name, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const whereCondition = {};

    // 기본 검색 조건을 '상품 이름'으로 설정
    if (name || (!productId && !name)) {
        whereCondition.ProductName = { [Op.like]: `%${name || ''}%` };
        console.log('상품 이름 검색 조건 적용:', whereCondition.ProductName);
    }

    // 상품 ID 검색 조건 추가
    if (productId) {
        whereCondition.ProductID = { [Op.like]: `%${productId}%` };
        console.log('상품 ID 검색 조건 적용:', whereCondition.ProductID);
    }

    // 상태 필터 추가
    if (status) {
        whereCondition.Status = status;
        console.log('상태 필터 적용:', whereCondition.Status);
    }

    // 기간 필터 추가 (createdAt 기준)
    if (startDate && endDate) {
        whereCondition.createdAt = {
            [Op.between]: [moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate()],
        };
        console.log('기간 필터 조건 적용:', whereCondition.createdAt);
    }

    try {
        const offset = (page - 1) * limit;
        const { rows: products, count } = await Products.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        const formattedProducts = products.map((product) => ({
            ...product.toJSON(),
            createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));

        console.log('검색된 상품 목록:', formattedProducts); // 검색 결과 확인

        res.json({
            products: formattedProducts,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('상품 검색 실패:', error);
        res.status(500).json({ message: '상품 검색 실패', error });
    }
};


// 리뷰 데이터 가져오기 (페이지네이션 적용)
const getReviews = async (req, res) => {
    const { page = 1, limit = 5 } = req.query; // 페이지당 5개 리뷰로 설정
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Reviews.findAndCountAll({
            include: [
                { model: User, attributes: ['LoginID'] },
                { model: Products, attributes: ['ProductName'] },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ReviewDate', 'DESC']], // 최신순 정렬
        });

        const formattedReviews = rows.map((review) => ({
            ...review.toJSON(),
            ReviewDate: moment(review.ReviewDate).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'), // 서울 시간 기준
        }));

        const totalPages = Math.ceil(count / limit);

        res.json({
            reviews: formattedReviews,
            totalPages,
            currentPage: parseInt(page),
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
    console.log('Received search parameters:', req.query); // 디버깅용

    // 검색 유형에 따라 검색 조건 추가 (리뷰 ID, 회원 ID, 리뷰 내용 등)
    if (searchType && query) {
        if (searchType === 'ReviewID') {
            whereCondition.ReviewID = { [Op.like]: `%${query}%` };
        } else if (searchType === 'UserID') {
            whereCondition.UserID = { [Op.like]: `%${query}%` };
        } else if (searchType === 'Content') {
            whereCondition.Content = { [Op.like]: `%${query}%` };
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
            include: [
                { model: User, attributes: ['LoginID'] },
                { model: Products, attributes: ['ProductName'] },
            ],
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
    const { ReplyContent } = req.body;

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
            // 새로운 답변 생성
            reply = await QnAReplies.create({
                QnAID: qnaId,
                ReplyContent,
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
    createCoupon,
    issueCoupon,
    getCoupons,
    editCoupon,
    getIssuedCoupons,
    updateCouponStatus,
    searchCoupons,
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
    updateProductStatus,
    deleteProductImage,
    searchProducts,
    getReviews,
    editReview,
    deleteReview,
    updateReviewStatus,
    deleteReviewImage,
    searchReviews,
    getQnAs,
    getQnAReply,
    replyToQnA,
    searchQnAs,
};
