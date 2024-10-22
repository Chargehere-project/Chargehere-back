'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

// 모델 불러오기
db.User = require('./User')(sequelize, Sequelize);
db.Inquiries = require('./Inquiries')(sequelize, Sequelize); // 수정된 부분
db.InquiryReplies = require('./InquiryReplies')(sequelize, Sequelize);

// 관계 설정 함수 불러오기
const applyAssociations = require('./associations');

// 관계 설정 적용
applyAssociations(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
