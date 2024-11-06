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
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'Cart', 
        }
    );
};
