module.exports = (seq, DataTypes) =>{
    return seq.define('User',{
        UserID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        LoginID: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        Password: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        Point: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        JoinDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        Address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    });
}