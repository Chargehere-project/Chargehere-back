const express = require('express');
const { signup, login, notice,everydayevent, notices, getChargers, name, chargelist, couponlist, products, orderlist, cart, quantity, deletecart, prepareOrder, findid, checkid, reviewwrite,productinfo,checkSession, buy } = require('../../controller/front');
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
router.post('/name',auth, name)
router.post('/chargelist', auth, chargelist)
router.post('/couponlist', auth, couponlist)
router.post('/orderlist', auth, orderlist)
router.post('/cart',auth,cart)
router.get('/products', products)
router.post('/quantity', auth, quantity)
router.post('/deletecart', auth, deletecart)
router.post('/prepare', auth , prepareOrder)
router.post('/findid', findid)
router.post('/checkid',checkid)
router.post('/reviewwrite', auth, reviewwrite)
router.get('/product/:id', productinfo)
router.get('/check-session',checkSession)
router.post('/buy',auth,buy)

module.exports = router;
