module.exports = (seq, DataTypes) => {
    return seq.define(
        'Products',
        {
            ProductID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            CategoryID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ProductName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            Price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            Discount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
            },
            Image: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            DetailInfo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'Products',
        }
    );
};
