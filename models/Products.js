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
                allowNull: true,
            },
            ProductName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            Price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Discount: {
                type: DataTypes.INTEGER,
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
            Status: {
                type: DataTypes.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
            },
        },
        {
            timestamps: true,
            tableName: 'Products',
        }
    );
};
