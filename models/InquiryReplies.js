module.exports = (sequelize, DataTypes) => {
    const InquiryReplies = sequelize.define(
        'InquiryReplies',
        {
            ReplyID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            InquiryID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ReplyContent: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'InquiryReplies',
            timestamps: false,
        }
    );

    return InquiryReplies;
};
