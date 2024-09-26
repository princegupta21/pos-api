const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {handleLoginUser, handleRegisterUser, handleAuthentication, handleLogout} = require('../controller/user')

router.post('/login', handleLoginUser)
router.post('/register', handleRegisterUser)
router.get('/authentication', handleAuthentication)
router.post('/logout', authMiddleware, handleLogout)
module.exports = router