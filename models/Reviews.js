module.exports = (seq, DataTypes) => {
    return seq.define(
        'Reviews',
        {
            ReviewID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            UserID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ProductID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Rating: {
                type: DataTypes.DECIMAL(3, 2), // 예: 4.5와 같은 소수점 포함
                allowNull: false,
            },
            Content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ReviewDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            Image: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            Status: {
                type: DataTypes.ENUM('visible', 'hidden', 'deleted'), // 상태 추가
                allowNull: false,
                defaultValue: 'visible', // 기본값 설정
            },
        },
        {
            timestamps: true, // createdAt, updatedAt 추가
            tableName: 'Reviews',
        }
    );
};
