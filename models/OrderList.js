module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderList', // 모델 이름을 OrderList로 설정
        {
            OrderListID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ProductID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            OrderDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            OrderStatus: {
                type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            CustomerName: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            CustomerPhoneNumber: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            CustomerAddress: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            timestamps: true, // createdAt, updatedAt 필드 자동 추가
            tableName: 'OrderList', // 테이블 이름을 'OrderList'로 설정
        }
    );
};
