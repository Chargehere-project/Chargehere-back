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
                allowNull: false,
            },
            OrderID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            TotalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            PaymentAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            PointUsed: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            PointEarned: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            PaymentMethod: {
                type: DataTypes.ENUM('Card', 'Cash', 'Points', 'Mixed'),
                allowNull: false,
            },
            TransactionDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            Status: {
                type: DataTypes.ENUM('Completed', 'Refunded', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Completed',
            },
            RefundReason: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'Transactions',
        }
    );
};