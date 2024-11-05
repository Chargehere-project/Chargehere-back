module.exports = (seq, DataTypes) => {
    return seq.define(
        'OrderList', 
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
                type: DataTypes.INTEGER,
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
            timestamps: true, 
            tableName: 'OrderList', 
        }
    );
};
