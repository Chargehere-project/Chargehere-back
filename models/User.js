module.exports = (seq, DataTypes) => {
    return seq.define(
        'User',
        {
            UserID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            LoginID: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            Name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            Password: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            Points: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            JoinDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            PhoneNumber: {
                type: DataTypes.STRING(20), // 대소문자 일치 점검
                allowNull: true,
            },
            Address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            Status: {
                type: DataTypes.ENUM('Active', 'Inactive', 'Withdrawn'),
                allowNull: false,
                defaultValue: 'Active',
            },
        },
        {
            timestamps: true, // createdAt, updatedAt 필드가 자동으로 추가됩니다.
            tableName: 'User', // 데이터베이스 테이블 이름 명시
        }
    );
};
