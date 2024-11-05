const bcrypt = require('bcrypt');

const generateHashedPassword = async () => {
    const password = '1234'; // 원하는 비밀번호
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
};

generateHashedPassword();
