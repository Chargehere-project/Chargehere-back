const db = require('../models');

const initDb = async () => {
    try {
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.sequelize.sync({ force: true });
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('데이터베이스 초기화 완료');
        process.exit(0);
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
        process.exit(1);
    }
};

initDb();