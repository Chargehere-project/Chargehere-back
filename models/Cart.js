module.exports = (seq, DataTypes) => {
    return seq.define(
        'Cart',
        {
            CartID: {
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
            Quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            timestamps: false, // 카트는 주문 완료 전 임시로 저장되는 데이터이므로 timestamps는 필요 없을 수 있음
            tableName: 'Cart', // 테이블 이름을 'Cart'로 설정
        }
    );
};
