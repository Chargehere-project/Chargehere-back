const express = require('express')
const { signup, login,notice } = require('../controller');
const router = express.Router()

//router.get('/',main)

//api
router.post('/signup', signup)
router.post('/login', login)
router.get('/notice',notice)

module.exports = router;