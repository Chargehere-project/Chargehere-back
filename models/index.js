'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize  = new Sequelize(config.database, config.username, config.password, config);

//모델
db.User =require('./User')(sequelize, Sequelize)
db.Notice = require('./Notice')(sequelize,Sequelize)
db.Coupon = require('./Coupon')(sequelize,Sequelize)
db.UserCoupon = require('./UserCoupon')(sequelize,Sequelize)
db.Point = require('./Point')(sequelize,Sequelize)



db.User.hasMany(db.UserCoupon,{foreignKey:'UserID', onDelete:'CASCADE'})
db.UserCoupon.belongsTo(db.User,{foreignKey:'UserID', onDelete:'CASCADE'})
db.Coupon.hasMany(db.UserCoupon,{foreignKey:'CouponID', onDelete:'CASCADE'})
db.UserCoupon.belongsTo(db.Coupon,{foreignKey:'CouponID', onDelete:'CASCADE'})
db.User.hasMany(db.Point,{foreignKey:'UserID', onDelete: 'CASCADE'})
db.Point.belongsTo(db.User,{foreignKey:'UserID', onDelete:'CASCADE'})


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
