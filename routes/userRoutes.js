const express=require("express");
const userRoute=express();
const path=require('path')

userRoute.use(express.json())   // body parsing
userRoute.use(express.urlencoded({ extended: true }));

const userController=require('../controllers/userController');// importing user controller 
const middleware = require('../middleware/auth')



userRoute.get('/',userController.loadhome)
userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.insertUser);

//login
userRoute.get('/login',middleware.isLogout,userController.loadLogin);
userRoute.post('/login',userController.verifylogin);

userRoute.get('/logout',middleware.isLogin,userController.userLogOut)

userRoute.get('/forgetpass',userController.loadforgetpass);
userRoute.post('/forgetpass',userController.sendforgrtpass);

userRoute.get('/forget-password',userController.loadforgetpassword);
userRoute.post('/forget-password',userController.Resetpassword);



userRoute.get('/registered',userController.loadLogin);

userRoute.get('/otp-verification',userController.loadotp);
userRoute.post('/verify-otp',userController.verifyotp);

userRoute.get('/home',middleware.isLogin,middleware.isBlock,userController.loadhome);

userRoute.get('/resend-otp',userController.resendotp)

userRoute.get('/shop',middleware.isLogin,middleware.isBlock,userController.loadShop)

userRoute.get('/productDetail',middleware.isLogin,middleware.isBlock,userController.loadShopDetail)

userRoute.post('/addtocart',middleware.isLogin,middleware.isBlock,userController.addtocart)
userRoute.get('/cart',middleware.isLogin,middleware.isBlock,middleware.isLogin,userController.loadCart)
userRoute.put('/cart/updateQuantity',middleware.isLogin,middleware.isBlock,userController.updateQuantity)
userRoute.post('/cart/RemoveProduct',middleware.isLogin,middleware.isBlock,userController.removeProduct)

userRoute.get('/checkout',middleware.isLogin,middleware.isBlock,userController.loadcheckout)

userRoute.post('/placeOrder',middleware.isLogin,middleware.isBlock,userController.placeOrder)
userRoute.post('/walletOrder',middleware.isLogin,middleware.isBlock,userController.walletOrder)
userRoute.post('/onlinePayment',middleware.isLogin,middleware.isBlock,userController.onlinePayment)
userRoute.post('/verifyOnlinePayment',middleware.isLogin,middleware.isBlock,userController.verifyPayment)
userRoute.get('/orderSuccess',middleware.isLogin,middleware.isBlock,userController.loadOrderSuccess)



userRoute.get('/profile',middleware.isLogin,middleware.isBlock,userController.loadprofile)
userRoute.put('/profile/changePass',middleware.isLogin,middleware.isBlock,userController.editPassword)
userRoute.post('/profile/addAddress',middleware.isLogin,middleware.isBlock,userController.addAddress)
userRoute.get('/profile/editAddress',middleware.isLogin,middleware.isBlock,userController.loadEditAddress)
userRoute.post('/profile/editAddress',middleware.isLogin,middleware.isBlock,userController.EditAddress)
userRoute.delete('/profile/dltAddress',middleware.isLogin,middleware.isBlock,userController.deleteAddress)
userRoute.get('/profile/orderDetails',middleware.isLogin,middleware.isBlock,userController.loadOrderDetails)

userRoute.put('/profile/cancellOrder',middleware.isLogin,middleware.isBlock,userController.cancellOrder)
userRoute.put('/orderReturn',middleware.isLogin,middleware.isBlock,userController.returnOrder)

userRoute.post('/profile/invoiceData',middleware.isLogin,middleware.isBlock,userController.invoiceData)

userRoute.get('/wallet',middleware.isLogin,middleware.isBlock,userController.loadWallet)
userRoute.post('/ApplyCoupon',middleware.isLogin,middleware.isBlock,userController.applyCoupon)




module.exports=userRoute
