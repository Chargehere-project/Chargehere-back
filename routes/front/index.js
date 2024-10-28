const express = require('express');
const { signup, login, notice,everydayevent, notices, getChargers } = require('../../controller/front');
const router = express.Router();
const { auth } = require('../../middleware');

//router.get('/',main)

//api
router.post('/signup', signup);
router.post('/login', login);
router.get('/notice', notice);
router.get('/notices', notices)
router.post('/everydayevent',auth, everydayevent)
router.get('/chargers', getChargers)


module.exports = router;
