module.exports = (seq, DataTypes) => {
    return seq.define(
        'Orders',
        {
            OrderID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            timestamps: true,
            tableName: 'Orders',
        }
    );
};
