module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderItem', 
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
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Subtotal: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true, 
            tableName: 'OrderItem', 
        }
    );
};
