module.exports = (seq, DataTypes) => {
    return seq.define(
        'Notice',
        {
            NoticeID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            Title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            Content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            PostDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'Notice',
        }
    );
};
