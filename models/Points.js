module.exports = (seq, DataTypes) => {
    return seq.define(
        'Points',
        {
            PointID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            TransactionID: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            ChargeDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ChargeType: {
                type: DataTypes.ENUM('Earned', 'Used', 'Expired', 'Deducted'),
                allowNull: false,
            },
            Amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'Points',
        }
    );
};
