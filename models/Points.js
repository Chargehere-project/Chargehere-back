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
                references: {
                    model: 'User', // User 모델을 참조
                    key: 'UserID', // User 모델의 기본 키 UserID를 외래 키로 참조
                },
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
