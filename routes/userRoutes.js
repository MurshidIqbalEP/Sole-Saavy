const express=require("express");
const userRoute=express();
const path=require('path')

userRoute.use(express.json())   // body parsing
userRoute.use(express.urlencoded({ extended: true }));

const userController=require('../controllers/userController');// importing user controller 
const cartController=require('../controllers/cartController');// importing cart controller 
const orderController=require('../controllers/orderController');// importing order controller 

const middleware = require('../middleware/auth')



userRoute.get('/',userController.loadhome)
userRoute.get('/register',middleware.isLogout,userController.loadRegister)
userRoute.post('/register',userController.insertUser);

//login
userRoute.get('/login',middleware.isLogout,userController.loadLogin);
userRoute.post('/login',middleware.isLogout,userController.verifylogin);
userRoute.get('/logout',middleware.isLogin,userController.userLogOut)
userRoute.get('/forgetpass',userController.loadforgetpass);
userRoute.post('/forgetpass',userController.sendforgrtpass);
userRoute.get('/forget-password',userController.loadforgetpassword);
userRoute.post('/forget-password',userController.Resetpassword);
userRoute.get('/registered',userController.loadLogin);
userRoute.get('/otp-verification',userController.loadotp);
userRoute.post('/verify-otp',userController.verifyotp);
userRoute.get('/resend-otp',userController.resendotp)

userRoute.get('/home',middleware.isBlock,userController.loadhome);
userRoute.get('/shop',middleware.isBlock,userController.loadShop)
userRoute.get('/productDetail',middleware.isBlock,userController.loadShopDetail)
userRoute.get('/wallet',middleware.isLogin,middleware.isBlock,userController.loadWallet)

//cart related routes
userRoute.post('/addtocart',middleware.isLogin,middleware.isBlock,cartController.addtocart)
userRoute.get('/cart',middleware.isLogin,middleware.isBlock,middleware.isLogin,cartController.loadCart)
userRoute.put('/cart/updateQuantity',middleware.isLogin,middleware.isBlock,cartController.updateQuantity)
userRoute.post('/cart/RemoveProduct',middleware.isLogin,middleware.isBlock,cartController.removeProduct)
userRoute.post('/stockCheck',middleware.isLogin,middleware.isBlock,cartController.stockChecking)

userRoute.get('/checkout',middleware.isLogin,middleware.isBlock,cartController.loadcheckout)


//order related routes
userRoute.post('/placeOrder',middleware.isLogin,middleware.isBlock,orderController.placeOrder)
userRoute.post('/walletOrder',middleware.isLogin,middleware.isBlock,orderController.walletOrder)
userRoute.post('/onlinePayment',middleware.isLogin,middleware.isBlock,orderController.onlinePayment)
userRoute.post('/verifyOnlinePayment',middleware.isLogin,middleware.isBlock,orderController.verifyPayment)
userRoute.get('/orderSuccess',middleware.isLogin,middleware.isBlock,orderController.loadOrderSuccess)

userRoute.get('/profile/orderDetails',middleware.isLogin,middleware.isBlock,orderController.loadOrderDetails)
userRoute.put('/profile/cancellOrder',middleware.isLogin,middleware.isBlock,orderController.cancellOrder)
userRoute.put('/orderReturn',middleware.isLogin,middleware.isBlock,orderController.returnOrder)
userRoute.post('/profile/invoiceData',middleware.isLogin,middleware.isBlock,orderController.invoiceData)
userRoute.post('/ApplyCoupon',middleware.isLogin,middleware.isBlock,orderController.applyCoupon)
userRoute.post('/removeCoupon',middleware.isLogin,middleware.isBlock,orderController.removeCoupon)


// profile related routes
userRoute.get('/profile',middleware.isLogin,middleware.isBlock,userController.loadprofile)
userRoute.put('/profile/changePass',middleware.isLogin,middleware.isBlock,userController.editPassword)
userRoute.post('/profile/addAddress',middleware.isLogin,middleware.isBlock,userController.addAddress)
userRoute.get('/profile/editAddress',middleware.isLogin,middleware.isBlock,userController.loadEditAddress)
userRoute.post('/profile/editAddress',middleware.isLogin,middleware.isBlock,userController.EditAddress)
userRoute.delete('/profile/dltAddress',middleware.isLogin,middleware.isBlock,userController.deleteAddress)










module.exports=userRoute
