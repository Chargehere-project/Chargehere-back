module.exports = (seq, DataTypes) => {
    return seq.define(
        'Banner',
        {
            BannerID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            BannerName: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            Type: {
                type: DataTypes.ENUM('Main', 'Shop'),
                allowNull: false,
            },
            BannerImage: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            timestamps: false,
            tableName: 'Banner',
        }
    );
};