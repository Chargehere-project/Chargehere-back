const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('coupon',{
        CouponID: {
            type: DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey: true,
        },
        CouponName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        ExpirationDate: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    })
}