module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'QnAReplies',
        {
            ReplyID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            QnAID: {
                type: DataTypes.INTEGER,
                allowNull: false, // QnA에 반드시 연결되어 있어야 함
            },
            ReplyContent: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: false,
            tableName: 'QnAReplies',
        }
    );
};
