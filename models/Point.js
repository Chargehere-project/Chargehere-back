const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('point',{
        PointID: {
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
        ChargeDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ChargeType: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        IssuedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        UsedAt: {
            type: DataTypes.ENUM('Earned', 'Used','Expired','Deducted'),
            allowNull: false,
        },
        Amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    })
}