module.exports = (seq, DataTypes) => {
    return seq.define(
        'Transaction',
        {
            TransactionID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false, // 트랜잭션은 반드시 유저와 연관되어야 함
            },
            OrderListID: {
                // OrderID를 OrderListID로 변경
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'OrderList',
                    key: 'OrderListID',
                },
            },
            TotalAmount: {
                type: DataTypes.INTEGER,
                allowNull: false, // 전체 결제 금액 (포인트 포함)
            },
            PaymentAmount: {
                type: DataTypes.INTEGER,
                allowNull: false, // 실제 결제된 금액
            },
            PointUsed: {
                type: DataTypes.INTEGER,
                allowNull: true, // 사용된 포인트, 있을 수도 있고 없을 수도 있음
            },
            PointEarned: {
                type: DataTypes.INTEGER,
                allowNull: true, // 적립된 포인트
            },
            PaymentMethod: {
                type: DataTypes.ENUM('Card', 'Cash', 'Points', 'Mixed'),
                allowNull: false, // 결제 방법 (카드, 현금, 포인트 또는 혼합)
            },
            TransactionDate: {
                type: DataTypes.DATEONLY,
                allowNull: false, // 트랜잭션 발생 날짜
            },
            Status: {
                type: DataTypes.ENUM('Completed', 'Refunded', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Completed', // 기본 상태는 완료
            },
            RefundReason: {
                type: DataTypes.STRING(255),
                allowNull: true, // 환불 사유는 선택 사항
            },
        },
        {
            timestamps: true, // 타임스탬프 추가
            tableName: 'Transactions', // 테이블 이름을 'Transactions'로 설정
        }
    );
};
