const { User, Notice, Points, UserCoupon, Products, OrderList, Cart, Reviews,Transactions } = require('../../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');


const signup = async (req, res) => {
    console.log(req.body, '회원가입');
    const { id, password, name, residence, phone } = req.body;
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
};
// controllers/front/index.js의 login 함수 수정
// controllers/front/index.js
const login = async (req, res) => {
    try {
        console.log('로그인 시도 - 세션 ID:', req.sessionID);
        const { id, password } = req.body;
        const find = await User.findOne({ where: { LoginID: id } });

        if (find && find.Password === password) {
            // JWT 토큰 생성
            const token = jwt.sign(
                {
                    UserID: find.UserID,
                    LoginID: find.LoginID,
                    UserName: find.Name,
                },
                process.env.SECRET,
                { expiresIn: '24h' }
            );

            // 세션에 데이터 저장
            req.session.userDetails = {
                phoneNumber: find.PhoneNumber,
                address: find.Address,
            };

            // 세션 저장을 확실히 하기 위해 Promise 사용
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error('세션 저장 실패:', err);
                        reject(err);
                    } else {
                        console.log('세션 저장 성공:', {
                            sessionID: req.sessionID,
                            session: req.session,
                            userDetails: req.session.userDetails,
                        });
                        resolve();
                    }
                });
            });

            // 응답 보내기 전에 쿠키 설정 확인
            console.log('응답 보내기 전 쿠키:', res.getHeaders()['set-cookie']);

            res.json({
                result: true,
                code: 100,
                response: { token },
                message: '로그인 성공',
            });
        } else {
            res.json({
                result: false,
                code: find ? 1000 : 1001,
                message: find ? '비밀번호 틀렸습니다.' : '회원이 아닙니다.',
            });
        }
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ result: false, message: '서버 오류' });
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
            Description: '출석이벤트',
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
        res.json({ result: true, name: find.Name, point: find.Points });
    } catch (error) {
        console.error('이름과 포인트 조회 오류', error);
        res.status(500).json({ result: false, message: '서버 오류' });
    }
};
const chargelist = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(req.body, '충전내역');
        const find = await Points.findAll({ where: { UserID: userId }, order: [['ChargeDate', 'DESC']], limit: 5 });
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

const orderlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await OrderList.findAll({
            where: { UserID: userId },
            include: [
                {
                    model: Product,
                    attributes: ['ProductID', 'ProductName'],
                },
                {
                    model: Review,
                    attributes: ['ReviewID'],
                    required: false,
                },
            ],
        });

        // hasReview 필드 추가
        const ordersWithReviewStatus = orders.map((order) => ({
            ...order.toJSON(),
            hasReview: !!order.Review, // Review가 존재하면 true, 없으면 false
        }));

        res.json({
            result: true,
            data: ordersWithReviewStatus,
        });
    } catch (error) {
        console.error('주문 목록 조회 오류:', error);
        res.status(500).json({
            result: false,
            message: '주문 목록 조회 실패',
        });
    }
};
const cart = async (req, res) => {
    try {
        const { userId } = req.body;
        const find = await Cart.findAll({
            where: { UserID: userId },
            include: [
                {
                    model: Products,
                    attributes: ['ProductName'],
                },
            ],
        });
        res.json({ result: true, data: find });
    } catch (error) {
        console.error('장바구니 서버 오류', error);
        res.status(500).json({ result: false, message: '서버오류' });
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
        const { userId, productId, rating, content, orderId } = req.body;
        console.log(req.body, '리뷰쓰기');

        const find = await Reviews.create({
            UserID: userId,
            ProductID: productId,
            Rating: rating,
            Content: content,
            ReviewDate: new Date(),
        });
        res.json({ result: true, message: '리뷰작성완료' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: false, message: '서버오류' });
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
        console.log(req.body)
        const {UserID, ProductID, Amount, CustomerName, CustomerPhoneNumber, CustomerAddress, Quantity} = req.body
        const result = await OrderList.create({
            UserID, ProductID, Amount, CustomerName, CustomerPhoneNumber, CustomerAddress, 
            OrderDate: new Date(),
        })
        res.json({ result: true, message: '리뷰작성완료', data: result.OrderListID })
    } catch (error) {
        console.error('제품 상세 조회 오류:', error);
        res.status(500).json({
            result: false,
            message: '서버 오류',
        });
    }
};
const order = async (req, res) => {
    try {
        const id = req.params.id;
        
        const orderData = await OrderList.findOne({
            where: { OrderListID: id },
            include: [{
                model: Products,
                attributes: ['ProductID', 'ProductName', 'Price', 'Image']
            }]
        });

        if (!orderData) {
            return res.status(404).json({
                result: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }

        console.log('orderData:', JSON.stringify(orderData, null, 2));  // 데이터 확인용

        // null check 추가
        if (!orderData.Product) {
            return res.status(404).json({
                result: false,
                message: '주문에 해당하는 상품 정보를 찾을 수 없습니다.'
            });
        }

        // 프론트엔드 인터페이스에 맞게 데이터 구조화
        const formattedOrder = {
            orderListId: orderData.OrderListID,
            items: [{
                productID: orderData.Product.ProductID,        // Product로 수정
                productName: orderData.Product.ProductName,    // Product로 수정
                quantity: 1,  // 또는 orderData의 quantity 필드
                price: orderData.Product.Price,               // Product로 수정
                image: orderData.Product.Image                // Product로 수정
            }],
            totalAmount: orderData.Amount,
            discount: 0,
            paymentAmount: orderData.Amount
        };

        res.json({
            result: true,
            data: formattedOrder
        });

    } catch (error) {
        console.error('주문 조회 중 오류:', error);
        console.error(error.stack);  // 스택 트레이스 추가
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

const usercoupon = async(req,res) =>{
    try{
        const {userId} = req.body
        console.log(req.body,'쿠폰쿠폰');
        const find = await UserCoupon.findOne({where: { UserID: userId }})
        res.json({result: true, data: find });
    }catch(error){
        res.status(500).json({
            result: false,
            message: '쿠폰 조회 중 오류가 발생했습니다.'
        });
    }
}

const transaction = async(req, res) => {
    try {
        console.log('받은 요청 데이터:', req.body);
        
        const { 
            orderListId,  // 주의: orderListId로 받음
            userId,
            totalAmount,
            paymentAmount, 
            pointUsed,
            paymentMethod, 
            status,
            recipientInfo 
        } = req.body;

        // 트랜잭션 생성 - OrderListID로 필드명 맞춤
        const transaction = await Transactions.create({
            OrderListID: orderListId,  // orderListId를 OrderListID로 매핑
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
                Status: 'PAID',
                CustomerName: recipientInfo.name,
                CustomerPhoneNumber: recipientInfo.phone,
                CustomerAddress: recipientInfo.address
            },
            { where: { OrderListID: orderListId } }
        );

        // 포인트 사용 기록 
        if (pointUsed > 0) {
            await Points.create({
                UserID: userId,
                Amount: -pointUsed,
                TransactionID: transaction.TransactionID,
                Description: '상품 구매 시 포인트 사용',
                Points_date: new Date()
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
                TransactionID: transaction.TransactionID,
                Description: '상품 구매 적립',
                Points_date: new Date(),
                ChargeDate:  new Date(),
                ChargeType: 'Earned'
            });

            // 사용자 포인트 증가
            await User.increment('Points', {
                by: earnedPoints,
                where: { UserID: userId }
            });
        }

        res.json({
            success: true,
            data: transaction,
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
      data: {  // axios는 data 속성 사용
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,
      }
    });

    // 결제 성공 비즈니스 로직을 구현하세요.
    console.log(response.data);  // axios는 .data로 응답 본문에 접근
    res.status(response.status).json(response.data);
    
  } catch (error) {
    // 결제 실패 비즈니스 로직을 구현하세요.
    console.log(error.response.data);
    res.status(error.response.status).json(error.response.data);
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
    cart,
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
    latestorder,
    searchproduct,
    confirm,
};
