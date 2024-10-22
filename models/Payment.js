module.exports = (seq, DataTypes) =>{
    return seq.define('payment',{
        PaymentID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'UserID'
            }, onDelete: 'CASCADE'
        },
        Amount: {
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
        Status: {
            type: DataTypes.ENUM('Active', 'Inactive','Withdrawn'),
            allowNull: true,
        },
    });
}