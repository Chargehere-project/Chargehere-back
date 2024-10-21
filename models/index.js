'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize  = new Sequelize(config.database, config.username, config.password, config);

//모델
db.User =require('./User')(sequelize, Sequelize)
db.Notice = require('./Notice')(sequelize,Sequelize)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
