const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('usercoupon',{
        UserCouponID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'UserID'
            }, onDelete: 'CASCADE'
        },
        CouponID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'coupons',
                key: 'CouponID'
            }, onDelete: 'CASCADE'
        },
        IsUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        IssuedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        UsedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    })
}