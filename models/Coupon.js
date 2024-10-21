const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('coupons',{
        CouponID: {
            type: DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey: true,
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'UserID',
            },
            onDelete: 'CASCADE',
        }

    })
}