// controller/admin/CouponController.js
const { User, Coupons, UserCoupon } = require('../../models');
const { Op } = require('sequelize');

// 새로운 쿠폰 생성
// 쿠폰 생성 로직
const createCoupon = async (req, res) => {
    const { name, discountAmount, startDate, expiry, status } = req.body;

    // 입력 유효성 검사
    if (!name || !discountAmount || !startDate || !expiry || !status) {
        return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        // 새로운 쿠폰 생성
        const newCoupon = await Coupons.create({
            CouponName: name,
            DiscountAmount: discountAmount,
            StartDate: new Date(startDate), // 현재 날짜로 변환
            ExpirationDate: new Date(expiry), // 종료일로 변환
            Status: status,
        });

        res.status(201).json({ message: '쿠폰이 성공적으로 생성되었습니다.', coupon: newCoupon });
    } catch (error) {
        console.error('쿠폰 생성 실패:', error); // 디버깅 용도로 콘솔에 로그 출력
        res.status(500).json({ message: '쿠폰 생성에 실패했습니다.', error });
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
    const { page = 1, limit = 10, name, status, startDate, endDate, fetchTotalCount } = req.query;
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
        // 총 쿠폰 수 계산 (필요한 경우 fetchTotalCount가 true일 때만 수행)
        if (fetchTotalCount === 'true') {
            const totalCount = await Coupons.count({ where: whereCondition });
            console.log('Total coupon count (initial load):', totalCount); // 디버깅용 콘솔 로그
            return res.json({ totalItems: totalCount });
        }

        // 페이지네이션 데이터 반환
        const { count, rows } = await Coupons.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: UserCoupon,
                    attributes: ['IsUsed'],
                    as: 'UserCoupons',
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']], // 최신순 정렬
        });

        console.log('Total coupon count (paginated):', count); // 디버깅용 콘솔 로그
        console.log('Paginated coupon data:', rows); // 반환된 쿠폰 데이터 확인

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
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


module.exports = {
    createCoupon,
    issueCoupon,
    getCoupons,
    editCoupon,
    getIssuedCoupons,
    updateCouponStatus,
    searchCoupons,
    // getTotalUserCouponsCount,
};
