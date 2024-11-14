const express = require('express');
const {
    signup,
    login,
    notice,
    everydayevent,
    notices, userinfo, getCartCount,
    getChargers, getProductReviews,
    deleteAllCartItems,
    resetPassword,
    updateprofile,sendVerificationCode,
    checkUser,
    name,
    chargelist,
    point,
    couponlist,
    products,
    newproducts,
    orderlist,
    cart,
    quantity,
    deletecart,
    order,
    prepareOrder,
    findid,
    checkid,
    reviewwrite,
    productinfo,
    checkSession,
    buy,
    usercoupon,
    transaction,
    latestorder,
    searchproduct,
    confirm,
    createOrder,
    findqas,
    savecart,
    saleproducts, createReview,
    getOrderSummary,
    writecs,
    inquiries,
    qas,
    inquiryDetail,
    countqna
    
} = require('../../controller/front');
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
router.get('/newproducts',newproducts)
router.get('/saleproducts',saleproducts)
router.post('/quantity', auth, quantity)
router.post('/deletecart', auth, deletecart)
router.post('/prepare', auth , prepareOrder)
router.post('/findid', findid)
router.post('/checkid',checkid)
router.post('/reviewwrite', auth, reviewwrite)
router.get('/product/:id', productinfo)
router.get('/check-session',checkSession)
router.post('/buy',auth,buy)
router.get('/order/:id',order)
router.post('/point',point)
router.post('/usercoupon',usercoupon)
router.post('/transaction',transaction)
router.get('/order/latest',latestorder)
router.get('/search', searchproduct)
router.post("/confirm",confirm)
router.post('/savecart', savecart)
router.post('/orders/create',createOrder)
router.post('/cart/deletecart',deletecart)
router.post('/cart/alldelete',deleteAllCartItems)
router.post('/check-user', checkUser);
router.post('/send-mail', sendVerificationCode);
router.post('/reset-password', resetPassword);
router.post('/order-summary', getOrderSummary);
router.post('/updateProfile',updateprofile)
router.post('/userinfo',userinfo)
router.post('/reviews',createReview)
router.get('/reviews/product/:id',getProductReviews)
router.post('/cart/count', getCartCount)
router.post('/mall/cs',writecs)
router.get('/inquiries',inquiries)
router.get('/inquiry/:id',inquiryDetail)
router.post('/qas',qas)
router.get('/qas/product/:productId',findqas)
router.get('/qas/count',countqna)
module.exports = router;
