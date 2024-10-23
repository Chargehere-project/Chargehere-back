module.exports = (seq, DataTypes) => {
    return seq.define(
        'Categories',
        {
            CategoryID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            CategoryName: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            timestamps: false, // 카테고리 테이블에서는 createdAt, updatedAt 필드가 필요 없을 경우 false로 설정
            tableName: 'Categories',
        }
    );
};
