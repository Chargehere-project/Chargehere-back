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
            timestamps: false, 
            tableName: 'Categories',
        }
    );
};
