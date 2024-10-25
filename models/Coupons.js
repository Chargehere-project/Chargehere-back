module.exports = (seq, DataTypes) => {
    return seq.define(
        'Coupons',
        {
            CouponID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            CouponName: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            DiscountAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            StartDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            ExpirationDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            Status: {
                type: DataTypes.ENUM('active', 'expired', 'deleted'),
                allowNull: false,
                defaultValue: 'active', // 기본값을 'active'로 설정
            },
        },
        {
            timestamps: true,
            tableName: 'Coupons',
        }
    );
};
