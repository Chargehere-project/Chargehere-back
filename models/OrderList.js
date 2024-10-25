module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderList', // 모델 이름을 OrderList로 변경
        {
            OrderListID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            TransactionID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            TotalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            OrderDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            OrderStatus: {
                type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Pending',
            },
        },
        {
            timestamps: true, // 타임스탬프 유지
            tableName: 'OrderList', // 테이블 이름을 'OrderList'로 설정
        }
    );
};
