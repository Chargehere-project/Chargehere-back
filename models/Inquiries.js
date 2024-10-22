const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('inquiry',{
        InquiryID: {
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
        InquiryType: {
            type: DataTypes.ENUM('EV', 'Shop'),
            allowNull: false,
        },
        Title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        Status: {
            type: DataTypes.ENUM('Pending', 'Answered','Closed'),
            defaultValue: 'Pending',
            allowNull: false,
        },
    })
}