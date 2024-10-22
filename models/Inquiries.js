module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Inquiries',
        {
            InquiryID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
            InquiryType: {
                type: DataTypes.ENUM('EV', 'Shop'),
                allowNull: true,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            Content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'Inquiries',
        }
    );
};