const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getTransactions,
    getTransactionById,
    updateTransactionStatus,
    updateOrderListStatus,
    searchTransactions,
} = require('../../controller/admin/TransactionController');

// 트랜잭션 목록 가져오는 라우트
router.get('/', verifyToken, getTransactions);

// 특정 트랜잭션을 ID로 가져오는 라우트
router.get('/:transactionId', verifyToken, getTransactionById);

// 트랜잭션 상태 업데이트 라우트 (OrderList 상태 업데이트)
router.put('/:transactionId/orderlist/status', verifyToken, updateOrderListStatus); 

router.get('/search', verifyToken, searchTransactions);

module.exports = router;
