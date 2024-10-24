const express = require('express');
const { signup, login, notice,everydayevent } = require('../../controller/front');
const router = express.Router();
const { auth } = require('../../middleware');

//router.get('/',main)

//api
router.post('/signup', signup);
router.post('/login', login);
router.get('/notice', notice);
router.post('/everydayevent',auth, everydayevent)

module.exports = router;
