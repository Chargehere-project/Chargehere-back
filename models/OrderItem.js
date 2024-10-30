module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderItem', // 모델 이름을 OrderItem으로 설정
        {
            OrderItemID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            OrderListID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'OrderList', // 참조 테이블 이름
                    key: 'OrderListID',
                },
            },
            ProductID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Products', // 참조 테이블 이름
                    key: 'ProductID',
                },
            },
            Quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            Subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            timestamps: true, // createdAt, updatedAt 필드 자동 추가
            tableName: 'OrderItem', // 테이블 이름을 'OrderItem'로 설정
        }
    );
};
