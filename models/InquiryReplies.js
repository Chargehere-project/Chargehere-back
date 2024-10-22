const {DataTypes} = require('sequelize')

module.exports = (seq, DataTypes) =>{
    return seq.define('inquiryreply',{
        ReplyID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        InquiryID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'inquiries',
                key: 'InquiryID'
            }, onDelete: 'CASCADE'
        },
        ReplyContent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    })
}