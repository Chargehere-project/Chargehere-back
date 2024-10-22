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
            ExpirationDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            tableName: 'Coupons',
        }
    );
};