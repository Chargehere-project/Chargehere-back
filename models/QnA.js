module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'QnA',
        {
            QnAID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: true, // UserID는 null 가능
            },
            Title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            Status: {
                type: DataTypes.ENUM('Pending', 'Answered', 'Closed'),
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
