module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'QnA',
        {
            QnAID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            ProductID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            Title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            Status: {
                type: DataTypes.ENUM('Pending', 'Answered'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            Content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: false,
            tableName: 'QnA',
        }
    );
};
