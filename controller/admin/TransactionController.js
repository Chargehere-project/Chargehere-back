const { User, Transactions, OrderList } = require('../../models'); // 모델 가져오기
const { Op } = require('sequelize');

// 트랜잭션 목록 가져오기
const getTransactions = async (req, res) => {
    
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // 트랜잭션과 함께 User 및 OrderList 모델 포함
        const { count, rows } = await Transactions.findAndCountAll({
            include: [
                {
                    model: User,
                    attributes: ['LoginID'], // User 모델에서 LoginID만 포함
                },
                {
                    model: OrderList, // OrderList 모델을 추가
                    attributes: ['OrderStatus'], // OrderStatus만 가져옴
                },
            ],
            limit: parseInt(limit),
            offset,
            order: [['TransactionDate', 'DESC']], // 최신부터 정렬
        });

        rows.forEach((transaction) => {
            console.log("OrderListID:", transaction.OrderListID);  // OrderListID 확인
            console.log("OrderList:", transaction.OrderList);  // OrderList가 제대로 연결되었는지 확인
        });
        

        const totalPages = Math.ceil(count / limit); // 총 페이지 수 계산

        res.status(200).json({
            transactions: rows,
            totalPages,
            totalTransactions: count, // 총 트랜잭션 개수 추가
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
};



// 특정 트랜잭션 상세 정보 가져오기
const getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.query; // 쿼리 파라미터에서 transactionId를 가져옴

        console.log('Transaction ID from query:', transactionId); // 확인용 로그

        const transaction = await Transactions.findOne({
            where: { TransactionID: transactionId },
            include: [
                {
                    model: User,
                    attributes: ['LoginID'],
                },
                {
                    model: OrderList,
                    attributes: ['OrderStatus'],
                },
            ],
        });

        if (!transaction) {
            console.log('No transaction found for ID:', transactionId); // 디버깅 로그
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ error: 'Error fetching transaction details' });
    }
};







// 거래 상태 업데이트 (OrderList의 상태 변경)
const updateOrderListStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status } = req.body;

        // 트랜잭션과 그에 연결된 OrderList를 찾음
        const transaction = await Transactions.findOne({
            where: { TransactionID: transactionId },
            include: [
                {
                    model: OrderList,
                    required: true,
                },
            ],
        });

        if (!transaction || !transaction.OrderList) {
            return res.status(404).json({ error: 'OrderList가 없습니다.' });
        }

        // 로그를 추가하여 OrderList가 제대로 불러와졌는지 확인
        console.log('Fetched OrderList:', transaction.OrderList);

        // OrderList 상태 업데이트
        transaction.OrderList.OrderStatus = status;
        await transaction.OrderList.save(); // 변경 사항 저장

        res.status(200).json({ message: 'OrderList 상태 업데이트 성공' });
    } catch (error) {
        console.error('OrderList 상태 업데이트 오류:', error);
        res.status(500).json({ error: 'OrderList 상태 업데이트 오류' });
    }
};

// 거래 검색 함수 수정
const searchTransactions = async (req, res) => {
    try {
        const { searchType, searchValue, startDate, endDate, status } = req.query;

        // 조건을 동적으로 적용하여 필터링
        let whereConditions = {};

        if (searchType === 'loginID' && searchValue) {
            whereConditions['$User.LoginID$'] = { [Op.like]: `%${searchValue}%` };
        }

        if (startDate && endDate) {
            whereConditions['TransactionDate'] = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        if (status) {
            whereConditions['$OrderList.OrderStatus$'] = status;
        }

        const transactions = await Transactions.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    attributes: ['LoginID'],
                },
                {
                    model: OrderList,
                    attributes: ['OrderStatus'],
                },
            ],
            order: [['TransactionDate', 'DESC']],
        });

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error searching transactions:', error);
        res.status(500).json({ error: 'Error searching transactions' });
    }
};




module.exports = {
    getTransactions,
    getTransactionById,
    updateOrderListStatus,
    searchTransactions,
};


