module.exports = (seq, DataTypes) => {
    return seq.define(
        'Admin',
        {
            AdminID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            LoginID: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            Name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            Password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            timestamps: false,
            tableName: 'Admin',
        }
    );
};
