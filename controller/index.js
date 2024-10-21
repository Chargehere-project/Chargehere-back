const {User,Notice} = require('../models')

const signup = async(req,res) =>{
    console.log(req.body,'회원가입')
    const {id,password,name,residence,phone} = req.body
    const result = await User.create({LoginID: id,
        Password: password,
        Name: name,
        Address: residence,
        phone: phone,
        Point: 0,
        JoinDate: new Date(),})
        res.json({result:true})
}
const login = async(req,res) =>{
    const{userid,pw} = req.body;
    const result= await User.findOne({LoginID:userid,Password:pw})
    res.json({result:true, data: result})
}
const notice = async(req,res) =>{
    try {
        const result = await Notice.findOne({
            order: [['createdAt', 'DESC']],
            attributes: ['Title']
        });

        if (!result) {
            return res.status(404).json({ result: false, message: "공지사항이 없습니다." });
        }

        res.json({ result: true, data: result.Title });
    } catch (error) {
        console.error('공지사항 조회 중 오류 발생:', error);
        res.status(500).json({ result: false, message: "서버 오류가 발생했습니다." });
    }
};

module.exports = {signup,login,notice}