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
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login',userController.verifylogin);

userRoute.get('/logout',middleware.isLogin,userController.userLogOut)

userRoute.get('/forgetpass',userController.loadforgetpass);
userRoute.post('/forgetpass',userController.sendforgrtpass);

userRoute.get('/forget-password',userController.loadforgetpassword);
userRoute.post('/forget-password',userController.Resetpassword);



userRoute.get('/registered',userController.loadLogin);

userRoute.get('/otp-verification',userController.loadotp);
userRoute.post('/verify-otp',userController.verifyotp);

userRoute.get('/home',middleware.isBlock,userController.loadhome);

userRoute.get('/resend-otp',userController.resendotp)

userRoute.get('/shop',middleware.isLogin,middleware.isBlock,userController.loadShop)

userRoute.get('/productDetail',userController.loadShopDetail)

userRoute.post('/addtocart',userController.addtocart)
userRoute.get('/cart',middleware.isLogin,userController.loadCart)
userRoute.put('/cart/updateQuantity',userController.updateQuantity)
userRoute.post('/cart/RemoveProduct',userController.removeProduct)

userRoute.get('/checkout',userController.loadcheckout)

userRoute.post('/placeOrder',userController.placeOrder)
userRoute.post('/onlinePayment',userController.onlinePayment)
userRoute.post('/verifyOnlinePayment',userController.verifyPayment)



userRoute.get('/profile',userController.loadprofile)
userRoute.put('/profile/changePass',userController.editPassword)
userRoute.post('/profile/addAddress',userController.addAddress)
userRoute.get('/profile/editAddress',userController.loadEditAddress)
userRoute.post('/profile/editAddress',userController.EditAddress)
userRoute.delete('/profile/dltAddress',userController.deleteAddress)
userRoute.get('/profile/orderDetails',userController.loadOrderDetails)

userRoute.put('/profile/cancellOrder',userController.cancellOrder)
userRoute.put('/orderReturn',userController.returnOrder)

userRoute.post('/profile/invoiceData',userController.invoiceData)




















module.exports=userRoute
