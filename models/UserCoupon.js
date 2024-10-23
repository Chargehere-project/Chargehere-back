module.exports = (seq, DataTypes) => {
    return seq.define(
        'UserCoupon',
        {
            UserCouponID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            CouponID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            IsUsed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            IssuedAt: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            UsedAt: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'UserCoupon',
        }
    );
};
