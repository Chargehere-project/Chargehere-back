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
                allowNull: false,
            },
            ProductID: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
