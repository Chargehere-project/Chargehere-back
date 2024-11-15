
const { User, Notice, Points, UserCoupon, Products, OrderList, Cart, Reviews,Transactions, QnA, QnAReplies, Inquiries,Coupons, OrderItem, InquiryReplies } = require('../../models');

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
    console.log(req.body, '회원가입');
    const { id, password, name, residence, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
        LoginID: id,
        Password: hashedPassword,
        Name: name,
        Address: residence,
        PhoneNumber: phone,
        Points: 0,
        JoinDate: new Date(),
    });
    res.json({ result: true });
};
// controllers/front/index.js의 login 함수 수정
// controllers/front/index.js
const login = async (req, res) => {
    try {
        const { id, password } = req.body;

        // 1. 사용자 조회
        const user = await User.findOne({ where: { LoginID: id } });

        // 2. 사용자 존재 여부 확인
        if (!user) {
            return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 3. 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ result: false, message: '비밀번호가 틀렸습니다.' });
        }

        // 4. JWT 토큰 생성
        const token = jwt.sign(
            {
                UserID: user.UserID,
                LoginID: user.LoginID,
                UserName: user.Name,
            },
            process.env.SECRET,
            { expiresIn: '24h' }
        );

        // 5. 세션에 사용자 정보 저장
        req.session.userDetails = {
            phoneNumber: user.PhoneNumber,
            address: user.Address,
        };

        // 세션 저장
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 6. 성공 응답
        res.json({
            result: true,
            code: 100,
            response: { token },
            message: '로그인 성공',
        });
    } catch (error) {
        console.error('로그인 중 오류:', error);
        res.status(500).json({ result: false, message: '서버 오류가 발생했습니다.' });
    }
};

    // checkSession 컨트롤러도 수정
    const checkSession = async (req, res) => {
        console.log('세션 체크 요청 받음');
        console.log('세션 ID:', req.sessionID);
        console.log('전체 세션:', req.session);

        if (!req.sessionID) {
            return res.json({ result: false, message: '세션 ID가 없습니다.' });
        }

        if (!req.session) {
            return res.json({ result: false, message: '세션 객체가 없습니다.' });
        }

        if (!req.session.userDetails) {
            return res.json({ result: false, message: '세션에 사용자 정보가 없습니다.' });
        }

        res.json({
            result: true,
            userDetails: req.session.userDetails,
        });
    };
    const notice = async (req, res) => {
        try {
            const notices = await Notice.findAll({
                order: [['NoticeID', 'DESC']],
                attributes: ['Title'],
                limit: 3,
            });

            console.log('notices 원본:', notices); // 원본 데이터 확인

            if (notices.length === 0) {
                return res.status(404).json({
                    result: false,
                    message: '공지사항이 없습니다.',
                });
            }

            const titles = notices.map((notice) => notice.Title);
            console.log('가공된 titles:', titles); // 가공된 데이터 확인

            res.json({
                result: true,
                data: titles,
            });
        } catch (error) {
            console.error('공지사항 조회 중 오류 발생:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };
    const notices = async (req, res) => {
        try {
            const result = await Notice.findAll({
                order: [['NoticeID', 'DESC']],
                attributes: ['NoticeID', 'Title', 'PostDate'],
            });

            // 방법 1: data 키로 보내기
            res.json({ result: true, data: result });
        } catch (error) {
            console.error('공지사항 조회 오류', error);
            res.status(500).json({
                result: false,
                message: '공지사항 조회 오류',
            });
        }
    };
    const everydayevent = async (req, res) => {
        try {
            console.log(req.body, '출석이벤트');
            const { points, reward } = req.body;
            const userId = req.user.UserID; // 미들웨어에서 설정한 user 정보 사용
            const user = await User.findByPk(userId);

            const result = await Points.create({
                UserID: userId,
                TransactionID: null,
                ChargeDate: new Date(),
                ChargeType: 'Earned',
                Amount: points,
                Description: '출석이벤트로 인한 적립',
            });

            user.Points += points;
            await user.save();
            res.json({ result: true, message: '포인트 지급 성공' });
        } catch (error) {
            console.error('포인트 지급 오류', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };

    // controller/front/index.js
    // controller/front/index.js
    const getChargers = async (req, res) => {
        try {
            // 충전소 기본 정보 가져오기 (위치 정보 포함)
            const stationResponse = await axios.get('http://apis.data.go.kr/B552584/EvCharger/getChargerInfo', {
                params: {
                    serviceKey: process.env.SERVICEKEY,
                    pageNo: 1,
                    numOfRows: 200, // 더 많은 데이터 가져오기
                    zcode: req.query.zcode, // 지역 코드 추가
                },
            });

            // 충전기 상태 정보 가져오기
            const statusResponse = await axios.get('http://apis.data.go.kr/B552584/EvCharger/getChargerStatus', {
                params: {
                    serviceKey: process.env.SERVICEKEY,
                    pageNo: 1,
                    numOfRows: 200,
                    zcode: req.query.zcode,
                },
            });

            const stations = stationResponse.data.items[0].item;
            const statuses = statusResponse.data.items[0].item;

            // 위치 정보가 있는 충전소 데이터만 필터링하고 상태 정보 병합
            const mergedData = stations
                .filter((station) => station.lat && station.lng) // 위치 정보가 있는 것만 필터링
                .map((station) => {
                    const status = statuses.find((s) => s.statId === station.statId);
                    return {
                        ...station,
                        stat: status?.stat || '9', // 상태 정보 추가 (없으면 9=상태미확인)
                        statUpdDt: status?.statUpdDt,
                        lastTsdt: status?.lastTsdt,
                        lastTedt: status?.lastTedt,
                        nowTsdt: status?.nowTsdt,
                    };
                });

            res.json({
                success: true,
                data: mergedData,
                totalCount: mergedData.length,
            });
        } catch (error) {
            console.error('충전소 데이터 조회 오류:', error);
            console.error('Error details:', error.response?.data);
            res.status(500).json({
                success: false,
                error: '충전소 데이터 조회 실패',
                message: error.message,
            });
        }
    };

    const name = async (req, res) => {
        try {
            const { userId } = req.body;
            const find = await User.findOne({ where: { UserID: userId } });

            if (!find) {
                return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
            }

            res.json({
                result: true,
                name: find.Name,
                point: find.Points,
                loginID: find.LoginID,
            });
        } catch (error) {
            console.error('이름과 포인트 조회 오류', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };
    const chargelist = async (req, res) => {
        try {
            const { userId } = req.body;
            console.log(req.body, '충전내역');
            const find = await Points.findAll({ where: { UserID: userId }, order: [['createdAt', 'DESC']], limit: 5 });
            res.json({ result: true, data: find });
        } catch (error) {
            console.error('충전내역 오류', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };

    const couponlist = async (req, res) => {
        try {
            const { userId } = req.body;
            console.log(req.body, '충전내역');
            const find = await UserCoupon.findAll({
                where: { UserID: userId },
                include: [
                    {
                        model: Coupons,
                        attributes: ['CouponName', 'StartDate', 'ExpirationDate'],
                    },
                ],
            });
            res.json({ result: true, data: find });
        } catch (error) {
            console.error('충전내역 오류', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };

    const products = async (req, res) => {
        try {
            const find = await Products.findAll({
                attributes: ['ProductID', 'ProductName', 'Price', 'Discount', 'Image'],
            });

            res.json({ result: true, data: find });
        } catch (error) {
            console.error('상품오류', error);
            res.status(500).json({ result: false, message: '서버오류' });
        }
    };


    const newproducts = async (req, res) => {
        try {
            const find = await Products.findAll({
                attributes: ['ProductID', 'ProductName', 'Price', 'Discount', 'Image'],
                order: [
                    ['createdAt', 'DESC']  // 최신순 정렬 (내림차순)
                ]
            });

            res.json({ result: true, data: find });
        } catch (error) {
            console.error('상품오류', error);
            res.status(500).json({ result: false, message: '서버오류' });
        }
    };

    const saleproducts = async (req, res) => {
        try {
            const find = await Products.findAll({
                attributes: ['ProductID', 'ProductName', 'Price', 'Discount', 'Image'],
                order: [
                    ['Discount', 'DESC']  // 할인율 높은 순으로 정렬
                ]
            });

            res.json({ result: true, data: find });
        } catch (error) {
            console.error('상품오류', error);
            res.status(500).json({ result: false, message: '서버오류' });
        }
    };

    const orderlist = async (req, res) => {
        try {
            const { userId } = req.body;
            console.log('오더리스트 아이디', userId);
            
            const orderItems = await OrderItem.findAll({
                include: [
                    {
                        model: OrderList,
                        where: { 
                            UserID: userId,

                        },
                        attributes: ['OrderDate', 'OrderStatus']
                    },
                    {
                        model: Products,
                        attributes: ['ProductID', 'ProductName']
                    }
                ],
                order: [[{ model: OrderList }, 'createdAt', 'DESC']]
            });

            // Reviews 정보를 OrderListID로 조회
            const reviews = await Reviews.findAll({
                where: {
                    OrderListID: orderItems.map(item => item.OrderListID)
                },
                attributes: ['OrderListID']
            });

            const orderItemsWithReviewStatus = orderItems.map(orderItem => {
                const item = orderItem.toJSON();
                return {
                    OrderID: item.OrderListID,
                    Product: {
                        ProductID: item.Product.ProductID,
                        ProductName: item.Product.ProductName
                    },
                    Quantity: item.Quantity,
                    Amount: item.Price * item.Quantity,
                    OrderDate: item.OrderList.OrderDate,
                    OrderStatus: item.OrderList.OrderStatus,
                    // OrderListID로 리뷰 존재 여부 확인
                    hasReview: reviews.some(review => review.OrderListID === item.OrderListID)
                };
            });

            res.json({
                result: true,
                data: orderItemsWithReviewStatus
            });

        } catch (error) {
            console.error('주문 목록 조회 상세 오류:', error);
            console.error('에러 스택:', error.stack);
            res.status(500).json({
                result: false,
                message: '주문 목록 조회 실패',
                error: error.message
            });
        }
    };

    const getcart = async (req, res) => {
        try {
            const { userId } = req.body;
    
            // userId 유효성 검사
            if (!userId) {
                return res.status(400).json({
                    result: false,
                    message: 'userId가 필요합니다.',
                });
            }
    
            // 장바구니 데이터 조회
            const cartItems = await Cart.findAll({
                where: {
                    UserID: userId,
                },
                include: [
                    {
                        model: Products,
                        attributes: ['ProductID', 'ProductName', 'Image', 'Price'], // 필요한 필드만 선택
                    },
                ],
            });
    
            // 장바구니가 비어 있는 경우
            if (cartItems.length === 0) {
                return res.status(404).json({
                    result: false,
                    message: '장바구니가 비어 있습니다.',
                });
            }
    
            // 성공적인 응답 반환
            res.json({
                result: true,
                data: cartItems,
            });
        } catch (error) {
            console.error('장바구니 데이터 조회 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };



    const quantity = async (req, res) => {
        try {
            const { cartId, quantity } = req.body;

            await Cart.update({ Quantity: quantity }, { where: { CartID: cartId } });

            res.json({ result: true, message: '수량이 업데이트되었습니다.' });
        } catch (error) {
            console.error('장바구니 수량 업데이트 오류:', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };
    const deletecart = async (req, res) => {
        try {
            const { cartId } = req.body;

            await Cart.destroy({
                where: { CartID: cartId },
            });

            res.json({ result: true, message: '상품이 삭제되었습니다.' });
        } catch (error) {
            console.error('장바구니 상품 삭제 오류:', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };
    const deleteAllCartItems = async (req, res) => {
        try {
            const { UserID } = req.body;  // userId -> UserID로 변경
            
            // 로깅 추가
            console.log('받은 데이터:', req.body);
            
            if (!UserID) {
                return res.status(400).json({
                    result: false,
                    message: '사용자 ID가 필요합니다.'
                });
            }

            // Cart 테이블에서 해당 사용자의 모든 항목 삭제
            const result = await Cart.destroy({
                where: {
                    UserID: UserID  // 칼럼명과 일치
                }
            });

            console.log('삭제 결과:', result);  // 로깅 추가

            res.json({
                result: true,
                message: '장바구니가 비워졌습니다.',
                deletedCount: result
            });

        } catch (error) {
            console.error('장바구니 전체 삭제 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '장바구니 비우기 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    };

    // 서버 측 코드
    const prepareOrder = async (req, res) => {
        const t = await sequelize.transaction();

        try {
            const { userId, cartItems, name, phone, address } = req.body;

            // OrderList 테이블에 저장
            const orderList = await OrderList.create(
                {
                    UserID: userId,
                    OrderDate: new Date(),
                    OrderStatus: 'Pending',
                    CustomerName: name,
                    CustomerPhoneNumber: phone,
                    CustomerAddress: address,
                },
                { transaction: t }
            );

            // OrderItem 테이블에 각 상품 정보 저장
            await Promise.all(
                cartItems.map((item) =>
                    OrderItem.create(
                        {
                            OrderListID: orderList.OrderListID,
                            ProductID: item.ProductID,
                            Quantity: item.Quantity,
                            Price: item.Price,
                            Subtotal: item.Price * item.Quantity,
                        },
                        { transaction: t }
                    )
                )
            );

            await t.commit();

            res.json({
                result: true,
                orderListId: orderList.OrderListID,
            });
        } catch (error) {
            await t.rollback();
            console.error('주문 준비 오류:', error);
            res.status(500).json({
                result: false,
                message: '주문 준비 중 오류가 발생했습니다.',
            });
        }
    };
    const findid = async (req, res) => {
        try {
            const { name, phone } = req.body;
            console.log(req.body, '아이디찾기');

            const find = await User.findOne({ where: { Name: name } });
            if (find) {
                if (find.PhoneNumber === phone) {
                    res.json({ result: true, code: 100, data: find, message: '아이디 찾기 성공' });
                } else {
                    res.json({ result: false, code: 1000, response: null, message: '핸드폰 번호가 틀렸습니다.' });
                }
            } else {
                res.json({ result: false, code: 1001, response: null, message: '회원이 아닙니다.' });
            }
        } catch (error) {
            console.error('아이디찾기 오류', error);
            res.status(500).json({
                result: false,
                message: '서버오류',
            });
        }
    };
    const checkid = async (req, res) => {
        try {
            const { userId } = req.body;
            console.log(req.body, '아이디중복검사');

            // ID가 비어있는 경우 체크
            if (!userId) {
                return res.status(400).json({
                    result: false,
                    code: 400,
                    message: '아이디를 입력해주세요',
                });
            }

            const find = await User.findOne({ where: { LoginID: userId } });

            if (!find) {
                return res.json({
                    result: true,
                    code: 200,
                    message: '사용가능한 아이디입니다',
                });
            } else {
                return res.status(409).json({
                    result: false,
                    code: 409,
                    message: '이미 존재하는 아이디입니다',
                });
            }
        } catch (error) {
            console.error('중복검사오류', error);
            return res.status(500).json({
                // return 추가
                result: false,
                code: 500, // 코드 추가
                message: '서버 오류가 발생했습니다',
            });
        }
    };

    const findpw = async (req, res) => {
        try {
            const { email } = req.body;
            // console.log(process.env);
            const { email_service, GMAIL, GPASS } = process.env;
            const transporter = nodemailer.createTransport({
                service: email_service,
                auth: {
                    user: GMAIL,
                    pass: GPASS,
                },
            });
            const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            const emailHtml =
                `<p>안녕하세요.</p>
            <p>해당 메일은 ` +
                email +
                `님의 비밀번호 확인 메일입니다.</p>
            <p>비밀번호는 <strong>[` +
                code +
                `]</strong> 입니다.</p>
            <p>추후 비밀번호를 꼭 변경해주시기 바랍니다.</p>`;
            const mailOptions = {
                from: GMAIL,
                to: email,
                subject: '차지히얼 비밀번호 확인 이메일이 도착하였습니다.',
                html: emailHtml,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.json({ result: false, info });
                } else {
                    console.log('Email Sent', info);
                    res.json({ result: true, code });
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ result: false, message: '서버오류' });
        }
    };
    const reviewwrite = async (req, res) => {
        try {
            // 요청된 데이터 확인
            console.log('리뷰쓰기 요청 데이터:', req.body);

            const { userId, productId, rating, content, orderId } = req.body;
            if (!userId || !productId || !rating || !content || !orderId) {
                console.error('필수 데이터가 누락되었습니다:', req.body);
                return res.status(400).json({ result: false, message: '필수 데이터가 누락되었습니다.' });
            }

            // 리뷰 데이터 확인
            const reviewData = {
                UserID: userId,
                ProductID: productId,
                Rating: rating,
                Content: content,
                ReviewDate: new Date(),
            };

            console.log('리뷰 작성 데이터:', reviewData); // 삽입할 데이터 확인

            // 데이터베이스에 리뷰 삽입
            const find = await Reviews.create(reviewData);

            // 성공적인 삽입 확인
            console.log('리뷰 작성 완료:', find);

            res.json({ result: true, message: '리뷰작성완료' });
        } catch (error) {
            // 오류 발생 시 에러 로그
            console.error('리뷰 작성 오류:', error);

            // 에러를 클라이언트에 전달
            res.status(500).json({ result: false, message: '서버오류', error: error.message });
        }
    };


    const productinfo = async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Products.findOne({
                where: { ProductID: id },
                attributes: ['ProductID', 'ProductName', 'Price', 'Discount', 'Image', 'DetailInfo'],
            });

            if (!product) {
                return res.status(404).json({
                    result: false,
                    message: '제품을 찾을 수 없습니다.',
                });
            }

            res.json({
                result: true,
                data: product,
            });
        } catch (error) {
            console.error('제품 상세 조회 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류',
            });
        }
    };
    const buy = async (req, res) => {
        try {
            console.log('주문 요청 데이터:', req.body);
            const {
                UserID, 
                ProductID, 
                Amount, 
                CustomerName, 
                CustomerPhoneNumber, 
                CustomerAddress, 
                Quantity
            } = req.body;

            // OrderList 생성
            const orderList = await OrderList.create({
                UserID, 
                ProductID, 
                Amount, 
                CustomerName, 
                CustomerPhoneNumber, 
                CustomerAddress, 
                OrderDate: new Date(),
            });

            // OrderItem 생성 - result.OrderListID 사용
            await OrderItem.create({
                OrderListID: orderList.OrderListID,  // 여기가 수정된 부분
                ProductID,
                Quantity,
                Price: Amount,
                Subtotal: Amount,
            });

            console.log('주문 완료:', orderList.OrderListID);

            res.json({ 
                result: true, 
                message: '주문이 완료되었습니다.', 
                data: orderList.OrderListID 
            });
        } catch (error) {
            console.error('주문 처리 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '주문 처리 중 서버 오류가 발생했습니다.',
                error: error.message
            });
        }
    };
    const order = async (req, res) => {
        try {
            const id = req.params.id;
            
            // OrderList 정보 조회
            const orderListData = await OrderList.findOne({
                where: { OrderListID: id },
                attributes: ['OrderListID', 'Amount', 'CustomerName', 'CustomerPhoneNumber', 'CustomerAddress']
            });

            if (!orderListData) {
                return res.status(404).json({
                    result: false,
                    message: '주문을 찾을 수 없습니다.'
                });
            }

            // OrderItem과 Product 정보 조회
            const orderItems = await OrderItem.findAll({
                where: { OrderListID: id },
                include: [{
                    model: Products,
                    attributes: ['ProductID', 'ProductName', 'Price', 'Image']
                }]
            });

            if (!orderItems || orderItems.length === 0) {
                return res.status(404).json({
                    result: false,
                    message: '주문 항목을 찾을 수 없습니다.'
                });
            }

            // 총 금액 계산
            const totalAmount = orderItems.reduce((sum, item) => {
                return sum + (item.Product.Price * item.Quantity);
            }, 0);

            // 프론트엔드 인터페이스에 맞게 데이터 구조화
            const formattedOrder = {
                orderListId: orderListData.OrderListID,
                customerName: orderListData.CustomerName,
                customerPhoneNumber: orderListData.CustomerPhoneNumber,
                customerAddress: orderListData.CustomerAddress,
                items: orderItems.map(item => ({
                    productID: item.Product.ProductID,
                    productName: item.Product.ProductName,
                    quantity: item.Quantity,
                    price: item.Product.Price,
                    image: item.Product.Image
                })),
                totalAmount: totalAmount,
                discount: 0,
                paymentAmount: orderListData.Amount
            };

            res.json({
                result: true,
                data: formattedOrder
            });

        } catch (error) {
            console.error('주문 조회 중 오류:', error);
            console.error(error.stack);
            res.status(500).json({
                result: false,
                message: '주문 조회 중 오류가 발생했습니다.'
            });
        }
    };
    const point = async(req,res) => {
        try {
            const { userId } = req.body;  // userId를 구조분해할당으로 받아옴
            console.log('요청받은 userId:', userId);

            if (!userId) {
                return res.status(400).json({
                    result: false,
                    message: 'userId가 필요합니다.'
                });
            }

            const find = await User.findOne({ 
                where: { UserID: userId }  // userId 사용
            });

            if (!find) {
                return res.status(404).json({
                    result: false,
                    message: '사용자를 찾을 수 없습니다.'
                });
            }

            res.json({ 
                result: true, 
                data: find 
            });

        } catch(error) {
            console.error('포인트 조회 중 오류:', error);
            console.error(error.stack);
            res.status(500).json({
                result: false,
                message: '포인트 조회 중 오류가 발생했습니다.'
            });
        }
    };

    const usercoupon = async (req, res) => {
        try {
            const { userId } = req.body;
            console.log(req.body, '쿠폰쿠폰');
    
            const find = await UserCoupon.findAll({
                where: { 
                    UserID: userId, 
                    IsUsed: 0 // 사용되지 않은 쿠폰만
                },
                include: [
                    {
                        model: Coupons,
                        attributes: ['CouponName', 'DiscountAmount', 'ExpirationDate'],
                        where: {
                            ExpirationDate: { [Op.gte]: new Date() }, // 만료되지 않은 쿠폰만
                        },
                    },
                ],
            });
    
            if (!find || find.length === 0) {
                return res.status(404).json({ result: false, message: '사용 가능한 쿠폰이 없습니다.' });
            }
    
            res.json({ result: true, data: find });
        } catch (error) {
            console.error('쿠폰 조회 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '쿠폰 조회 중 오류가 발생했습니다.',
            });
        }
    };

    const transaction = async(req, res) => {
        try {
            console.log('받은 요청 데이터:', req.body);
            
            const { 
                orderListId,
                userId,
                totalAmount,
                paymentAmount, 
                pointUsed,
                paymentMethod, 
                status,
                recipientInfo,
                orderItems,  // orderItems 추가
                couponUsed
            } = req.body;

            // 트랜잭션 생성
            const createdTransaction = await Transactions.create({
                OrderListID: orderListId,
                UserID: userId,
                TotalAmount: totalAmount,
                PaymentAmount: paymentAmount,
                PointUsed: pointUsed || 0,
                PaymentMethod: paymentMethod,
                TransactionDate: new Date()
            });

            // 주문 상태 업데이트
            await OrderList.update(
                { 
                    OrderStatus: 'Completed',
                    CustomerName: recipientInfo.name,
                    CustomerPhoneNumber: recipientInfo.phone,
                    CustomerAddress: recipientInfo.address
                },
                { where: { OrderListID: orderListId } }
            );
            if (couponUsed) {
                await UserCoupon.update(
                    { IsUsed: 1 }, // 쿠폰 사용 처리
                    { where: { CouponID: couponUsed, UserID: userId } }
                );
            }

            // 포인트 사용 기록 
            if (pointUsed > 0) {
                await Points.create({
                    UserID: userId,
                    Amount: -pointUsed,
                    TransactionID: createdTransaction.TransactionID,
                    Description: '상품 구매 시 포인트 사용',
                    Points_date: new Date(),
                    ChargeDate: new Date(),
                    ChargeType: 'Used'
                });

                
                // 사용자 포인트 차감
                await User.decrement('Points', {
                    by: pointUsed,
                    where: { UserID: userId }
                });
            }

            // 구매 포인트 적립 (결제 금액의 1%)
            const earnedPoints = Math.floor(paymentAmount * 0.01);
            if (earnedPoints > 0) {
                await Points.create({
                    UserID: userId,
                    Amount: earnedPoints,
                    TransactionID: createdTransaction.TransactionID,
                    Description: '상품 구매 적립',
                    Points_date: new Date(),
                    ChargeDate: new Date(),
                    ChargeType: 'Earned'
                });

                // 사용자 포인트 증가
                await User.increment('Points', {
                    by: earnedPoints,
                    where: { UserID: userId }
                });
            }

            // 장바구니 비우기
            if (orderItems && orderItems.length > 0) {
                await Cart.destroy({
                    where: {
                        CartID: orderItems.map(item => item.CartID)
                    }
                });
            }

            // 하나의 응답만 보내기
            res.json({
                success: true,
                transactionId: createdTransaction.TransactionID,
                earnedPoints,
                message: '거래가 성공적으로 처리되었습니다.'
            });
            
        } catch (error) {
            console.error('거래 내역 저장 중 오류:', error);
            res.status(500).json({
                success: false,
                message: '거래 내역 저장 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    };
    const latestorder = async (req, res) => {
        try {
            const order = await OrderList.findOne({
                order: [['createdAt', 'DESC']], 
                where: {
                    Status: 'PENDING'
                }
            });

            if (!order) {
                return res.status(404).json({
                    result: false,
                    message: '대기중인 주문을 찾을 수 없습니다.'
                });
            }

            res.json({
                result: true,
                orderListId: order.OrderListID,
                userId: order.UserID,
                totalAmount: order.Amount,
                paymentAmount: order.Amount, // 포인트 사용 전 금액
                customerName: order.CustomerName
            });
        } catch (error) {
            console.error('주문 조회 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '주문 조회 중 오류가 발생했습니다.'
            });
        }
    };
    const searchproduct = async(req,res) =>{
        const { query } = req.query;
        try {
            const products = await Products.findAll({
                where: {
                    ProductName: {
                        [Op.like]: `%${query}%`  // 부분 일치 검색을 위해 LIKE 사용
                    }
                },
                limit: 10
            });
            res.json({
                result: true, 
                data: products
            });
        } catch (error) {
            console.error('검색 에러:', error);
            res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
        }
    }

    const confirm = async(req,res) => {
    // 클라이언트에서 받은 JSON 요청 바디입니다.
    const { paymentKey, orderId, amount } = req.body;

    // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
    const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
    const encryptedSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.tosspayments.com/v1/payments/confirm',
            headers: {
                Authorization: encryptedSecretKey,
                'Content-Type': 'application/json'
            },
            data: {
                orderId: orderId,
                amount: amount,
                paymentKey: paymentKey,
            }
        });

        // 결제 성공 시 OrderStatus 업데이트
        const orderListId = orderId.split('-')[1];  // "123" 추출
        try {
            await OrderList.update(
                { 
                    OrderStatus: 'Completed',
                    PaymentDate: new Date()  // 결제 완료 시간도 함께 저장
                },
                {
                    where: { OrderListID: orderListId  }
                }
            );

            console.log('주문 상태 업데이트 성공:', orderListId);
            console.log(response.data);
            
            res.status(response.status).json({
                ...response.data,
                orderStatus: 'Completed'
            });
        } catch (updateError) {
            console.error('주문 상태 업데이트 실패:', updateError);
            // 결제는 성공했지만 상태 업데이트 실패
            res.status(500).json({
                success: true,
                payment: response.data,
                error: '결제는 성공했으나 주문 상태 업데이트에 실패했습니다.'
            });
        }
        
    } catch (error) {
        console.log(error.response.data);
        res.status(error.response.status).json(error.response.data);
    }
    }

    const savecart = async (req, res) => { 
        try {
            const { userId, productId, quantity, price } = req.body;
            console.log('장바구니 저장', req.body)
            const result = await Cart.create({ 
                UserID: userId,
                ProductID: productId,
                Quantity: quantity,
                Price: price
            });
            
            res.json({ 
                result: true,
                data: result 
            });
        } catch (error) {
            console.error('장바구니 추가 오류:', error); 
            res.status(500).json({
                result: false,
                message: '장바구니 추가 실패'
            });
        }
    }
    const createOrder = async (req, res) => {
        try {
            const {
                UserID,
                CustomerName,
                CustomerPhoneNumber,
                CustomerAddress,
                TotalAmount,
                OrderStatus,
                orderItems
            } = req.body;

            // 1. OrderList 생성
            const orderList = await OrderList.create({
                UserID,
                ProductID: orderItems[0].ProductID,
                Amount: TotalAmount,
                CustomerName,
                CustomerPhoneNumber,
                CustomerAddress,
                OrderStatus: OrderStatus || 'Pending',
                OrderDate: new Date()
            });

            // 2. OrderItems 생성 - Subtotal 추가
            await Promise.all(orderItems.map(item => 
                OrderItem.create({
                    OrderListID: orderList.OrderListID,
                    ProductID: item.ProductID,
                    Quantity: item.Quantity,
                    Price: item.Price,
                    Subtotal: item.Quantity * item.Price  // Subtotal 계산 추가
                })
            ));

            // 장바구니 삭제 로직을 제거함

            res.json({
                result: true,
                orderListId: orderList.OrderListID,
                message: '주문이 성공적으로 생성되었습니다.'
            });

        } catch (error) {
            console.error('주문 생성 실패:', error);
            res.status(500).json({
                result: false,
                message: '주문 생성 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    };


    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GPASS
        }
    });

    // 사용자 정보 확인
    const checkUser = async (req, res) => {
        try {
            const { name, email } = req.body;

            // Name과 LoginID로 사용자 조회
            const user = await User.findOne({
                where: {
                    Name: name,
                    LoginID: email,
                },
            });

            if (!user) {
                return res.status(404).json({
                    result: false,
                    message: '이름 또는 아이디(이메일)가 일치하지 않습니다.',
                });
            }

            res.json({
                result: true,
                message: '사용자 정보가 확인되었습니다.',
            });
        } catch (error) {
            console.error('사용자 확인 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };

    // 인증 코드 전송
    const sendVerificationCode = async (req, res) => {
        try {
            const { email } = req.body;

            // 인증코드 생성
            const code = String(Math.floor(100000 + Math.random() * 900000)); // 6자리 숫자 코드

            // Gmail SMTP 설정
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL, // .env에 저장된 Gmail
                    pass: process.env.GPASS, // .env에 저장된 Gmail 앱 비밀번호
                },
            });

            const mailOptions = {
                from: process.env.GMAIL, // 발신자 이메일
                to: email, // 수신자 이메일 (LoginID가 이메일 형식)
                subject: '비밀번호 재설정 인증코드',
                text: `인증코드: ${code}`,
            };

            // 이메일 전송
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('이메일 전송 실패:', error);
                    return res.status(500).json({
                        result: false,
                        message: '이메일 전송에 실패했습니다.',
                    });
                }

                res.json({
                    result: true,
                    code, // 인증코드 반환 (테스트 용도)
                    message: '인증코드가 이메일로 전송되었습니다.',
                });
            });
        } catch (error) {
            console.error('이메일 전송 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };

    // 임시 비밀번호 생성 및 재설정
    const resetPassword = async (req, res) => {
        try {
            const { name, email, newPassword } = req.body;

            // 사용자 확인
            const user = await User.findOne({
                where: {
                    Name: name,
                    LoginID: email,
                },
            });

            if (!user) {
                return res.status(404).json({
                    result: false,
                    message: '사용자를 찾을 수 없습니다.',
                });
            }

            // 비밀번호 해시화
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 비밀번호 업데이트
            await user.update({ Password: hashedPassword });

            res.json({
                result: true,
                message: '비밀번호가 성공적으로 재설정되었습니다.',
            });
        } catch (error) {
            console.error('비밀번호 재설정 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };
    const updateprofile = async (req, res) => {
        try {
            const { name, password, phone, address, userId } = req.body;

            const updatedData = {
                Name: name,
                PhoneNumber: phone,
                Address: address,
            };

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updatedData.Password = hashedPassword;
            }

            const result = await User.update(updatedData, { where: { UserID: userId } });

            if (result[0] > 0) {
                res.json({ success: true, message: '회원정보가 수정되었습니다.' });
            } else {
                res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('회원정보 수정 중 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    };


    const userinfo = async (req, res) => {
        try {
            const { userId } = req.body;
            
            const user = await User.findOne({
                where: { UserID: userId },
                attributes: ['PhoneNumber', 'Address']
            });

            if (user) {
                res.json({
                    result: true,
                    data: user
                });
            } else {
                res.status(404).json({
                    result: false,
                    message: '사용자를 찾을 수 없습니다.'
                });
            }
        } catch (error) {
            console.error('회원정보 조회 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.'
            });
        }
    };
    const createReview = async (req, res) => {
        try {
            console.log('받은 데이터:', req.body);

            const { OrderListID, UserID, ProductID, Rating, Content } = req.body;

            const review = await Reviews.create({
                OrderListID: parseInt(OrderListID),
                UserID: parseInt(UserID),
                ProductID: parseInt(ProductID),
                Rating: parseFloat(Rating),  // DECIMAL 타입이므로 parseFloat 사용
                Content: Content,
                ReviewDate: new Date(),
                Status: 'visible',  // 'Active' 대신 'visible' 사용
                Image: null
            });

            res.json({
                result: true,
                data: review,
                message: '리뷰가 성공적으로 등록되었습니다.'
            });

        } catch (error) {
            console.error('리뷰 등록 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '리뷰 등록 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    };
    const getProductReviews = async (req, res) => {
        try {
            const productId = req.params.id;
            
            const reviews = await Reviews.findAll({
                where: {
                    ProductID: productId,
                    Status: 'visible'
                },
                include: [
                    {
                        model: User,
                        attributes: ['Name']
                    }
                ],
                order: [
                    ['ReviewDate', 'DESC']
                ]
            });

            console.log('조회된 리뷰:', reviews);  // 디버깅용

            res.json({
                result: true,
                data: reviews
            });

        } catch (error) {
            console.error('리뷰 조회 중 오류:', error);
            res.status(500).json({
                result: false,
                message: '리뷰 조회 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    };
    const getCartCount = async (req, res) => {
        try {
            const { userId } = req.body;  // POST 요청의 body에서 userId 가져오기

            // Cart 테이블에서 해당 userId의 항목 개수 조회
            const cartCount = await Cart.count({
                where: {
                    UserID: userId
                }
            });

            res.json({
                success: true,
                count: cartCount
            });
            
        } catch (error) {
            console.error('장바구니 개수 조회 에러:', error);
            res.status(500).json({
                success: false,
                message: '장바구니 개수 조회 중 오류가 발생했습니다.'
            });
        }
    };


    const getOrderSummary = async (req, res) => {   
        try {
            const { userId } = req.body;
    
            // OrderStatus가 'Completed'인 주문 수 확인
            const CompletedOrders = await OrderList.count({
                where: { UserID: userId, OrderStatus: 'Completed' }
            });
    
            // OrderStatus가 'Shipping'인 주문 수 확인 ('Status' 대신 'OrderStatus' 사용)
            const ShippingdOrders = await OrderList.count({
                where: { UserID: userId, OrderStatus: 'Shipping' }  // Status -> OrderStatus로 수정
            });
    
            // OrderStatus가 'DeliveryCompleted'인 주문 수 확인
            const DeliveryCompletedOrders = await OrderList.count({
                where: { UserID: userId, OrderStatus: 'DeliveryCompleted' }
            });
            
    
            res.json({
                result: true,
                data: {
                    completed: CompletedOrders,
                    shipping: ShippingdOrders,
                    DeliveryCompleted: DeliveryCompletedOrders,
                }
            });
        } catch (error) {
            console.error('주문 요약 데이터 조회 오류:', error);
            res.status(500).json({ result: false, message: '서버 오류' });
        }
    };

    const getProfile = async (req, res) => {
        try {
            const { userId } = req.query; // Query Parameter에서 userId를 받음

            // userId를 이용해 사용자 정보 조회
            const user = await User.findOne({
                where: { UserID: userId },
                attributes: ['Name', 'PhoneNumber', 'Address'],
            });

            if (!user) {
                return res.status(404).json({ result: false, message: '사용자를 찾을 수 없습니다.' });
            }


            res.json({
                result: true,
                data: user,
            });
        } catch (error) {
            console.error('프로필 조회 오류:', error);
            res.status(500).json({
                result: false,
                message: '서버 오류가 발생했습니다.',
            });
        }
    };

    const verifyToken = async (req, res) => {
        try {
            const {userId} = req.body

            const result = await User.findOne({
                where: { UserID: userId },
            })
            res.json({
                result: true,
            })
        } catch (error) {
            console.error('토큰 검증 오류:', error);
            res.status(401).json({ 
                result: false, 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
    };

const writecs = async(req,res) =>{
 try{
    const {userId,title,content} = req.body
    const result = await Inquiries.create({
        UserID:userId,
        InquiryType:'Shop',
        Title:title,
        Content:content,
        Status:'Pending',
        CreatedAt: new Date()
    })
    res.json({result:true})
 }catch(error){
    console.error(' 데이터 조회 오류:', error);
    res.status(500).json({ result: false, message: '서버 오류' });
 }
}
const inquiries = async(req,res) =>{
    try{
        const result = await Inquiries.findAll({
            attributes: ['InquiryID', 'UserID', 'Title', 'Content', 'Status', 'CreatedAt'],
            include: [{
                model: InquiryReplies,  // 답변도 함께 가져오려면
                attributes: ['ReplyID', 'ReplyContent', 'CreatedAt']
            }],
            order: [['CreatedAt', 'DESC']]  // 최신글 순으로 정렬
        });

        res.json({ 
            result: true,
            data: result 
        });
    }catch(error){
        console.error('데이터 조회 오류:', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
}
const inquiryDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                result: false,
                message: '문의 ID가 필요합니다.'
            });
        }

        const result = await Inquiries.findOne({
            where: {
                InquiryID: id
            },
            include: [{
                model: InquiryReplies,
                attributes: ['ReplyID', 'ReplyContent', 'CreatedAt'],
                required: false  // 답변이 없어도 문의글은 조회되도록 LEFT JOIN 설정
            }],
            attributes: [
                'InquiryID',
                'UserID',
                'Title',
                'Content',
                'Status',
                'CreatedAt'
            ]
        });

        if (!result) {
            return res.status(404).json({
                result: false,
                message: '해당 문의를 찾을 수 없습니다.'
            });
        }

        res.json({
            result: true,
            data: result
        });

    } catch (error) {
        console.error('문의 상세 조회 오류:', error);
        res.status(500).json({
            result: false,
            message: '서버 오류'
        });
    }
};
const qas = async(req,res) =>{
    try{
        const {userId, productId, question ,title} = req.body
        const result = await QnA.create({
            ProductID:productId,
            UserID:userId,
            Title:title,
            Content:question,
            Status: 'Pending',
            CreatedAt: new Date(),
        })
        res.json({result:true})
    }catch(error){
        console.error('qna 조회 오류:',error)
        res.status(500).json({
            result:false,
            message:'서버 오류'
        })
    }
};
const findqas = async(req,res) =>{
    try {
        const productId = req.params.productId;

        // Sequelize 모델을 사용하여 데이터 조회
        const qas = await QnA.findAll({
            where: { ProductID: productId },
            include: [{
                model: QnAReplies,  // 답변 모델이 있다면
                attributes: ['ReplyContent', 'CreatedAt'],
                required: false  // LEFT JOIN
            }],
            order: [['CreatedAt', 'DESC']]  // 최신순 정렬
        });

        res.json({
            result: true,
            data: qas
        });

    } catch (error) {
        console.error('QA 조회 오류:', error);
        res.status(500).json({
            result: false,
            message: '서버 오류'
        });
    }
}
const countqna = async(req,res) =>{
    const { productId } = req.query;

    try {
        const count = await QnA.count({
            where: { ProductID: productId },
        }); // MongoDB 예시
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching Q&A count' });
    }
}

module.exports = {
    signup,
    login,
    notice,
    everydayevent,
    notices,
    getChargers,
    name,
    chargelist,
    couponlist,
    products,
    orderlist,
    getcart,
    quantity,
    deletecart,
    prepareOrder,
    findid,
    checkid,
    reviewwrite,
    productinfo,
    checkSession,
    buy,
    order,
    point,
    usercoupon,
    transaction,
    verifyToken,
    latestorder,
    searchproduct,
    confirm,
    savecart,
    newproducts,
    saleproducts,
    createOrder,
    deleteAllCartItems,
    qas,
    checkUser,
    sendVerificationCode,
    resetPassword,
    getOrderSummary,
    updateprofile,
    findqas,
    userinfo,
    createReview,
    getProductReviews,
    getCartCount,
    writecs,
    inquiries,
    inquiryDetail,
    countqna,
    getProfile
};

