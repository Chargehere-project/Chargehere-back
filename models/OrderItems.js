module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderItems',
        {
            OrderItemID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            OrderID: {
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
            timestamps: true,
            tableName: 'OrderItems',
        }
    );
};