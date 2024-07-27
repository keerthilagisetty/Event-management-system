const express=require('express');
const {  login,register,verifyToken, getUser, refreshToken, logout,addToWishlist,getWishlist,getBookingsOfUser } = require('../controllers/user-controller');
const router=express.Router();
router.post('/register',register);
router.post('/login',login);
router.get('/:id',verifyToken,getUser)
router.get('/refresh',refreshToken,verifyToken,getUser)
router.post('/logout',verifyToken,logout)
router.get("/bookings/:id", getBookingsOfUser);

module.exports=router;