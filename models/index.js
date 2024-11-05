'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

db.User = require('./User')(sequelize, Sequelize);
db.Inquiries = require('./Inquiries')(sequelize, Sequelize);
db.InquiryReplies = require('./InquiryReplies')(sequelize, Sequelize);
db.Products = require('./Products')(sequelize, Sequelize);
db.OrderList = require('./OrderList')(sequelize, Sequelize);
db.Cart = require('./Cart')(sequelize, Sequelize);
db.Transactions = require('./Transactions')(sequelize, Sequelize);
db.Points = require('./Points')(sequelize, Sequelize);
db.Coupons = require('./Coupons')(sequelize, Sequelize);
db.UserCoupon = require('./UserCoupon')(sequelize, Sequelize);
db.Categories = require('./Categories')(sequelize, Sequelize);
db.Admin = require('./Admin')(sequelize, Sequelize);
db.Notice = require('./Notice')(sequelize, Sequelize);
db.Reviews = require('./Reviews')(sequelize, Sequelize);
db.QnA = require('./QnA')(sequelize, Sequelize);
db.QnAReplies = require('./QnAReplies')(sequelize, Sequelize);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize);


// 관계 설정 함수 불러오기
const applyAssociations = require('./associations');

// 관계 설정 적용
applyAssociations(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 데이터베이스 연결 상태 확인
db.sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = db;