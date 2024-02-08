const express = require('express')
const adminRoute = express.Router();
const path = require('path');
const auth = require('../middleware/adminAuth');
const upload = require('../multer') // multer importing

adminRoute.use(express.json())   // body parsing
adminRoute.use(express.urlencoded({ extended: true }));


const adminController=require('../controllers/adminController');// importing user controller 


// adminRoute.get('/signup', adminController.loadAdminRegister);
// adminRoute.post('/signup', adminController.insertAdminData);


adminRoute.get('/',auth.isLogout,adminController.loadAdminLogin);
adminRoute.post('/',adminController.LoginVerify)

adminRoute.get('/logout',auth.isLogin,adminController.adminLogOut)

adminRoute.get('/Dashboard',auth.isLogin,adminController.loadHome);

adminRoute.get('/customers',auth.isLogin,adminController.loadCustomers);
adminRoute.post('/block-user',auth.isLogin,adminController.loadBlockUser);
adminRoute.post('/unBlock-user',auth.isLogin,adminController.loadunblockUser);

adminRoute.get('/category',auth.isLogin,adminController.loadCategory);
adminRoute.post('/category',auth.isLogin,adminController.addCategory);
adminRoute.post('/unlist-category',auth.isLogin,adminController.unlistCategory);
adminRoute.post('/list-category',auth.isLogin,adminController.listCategory);
adminRoute.get('/edit',auth.isLogin,adminController.loadEdit);
adminRoute.put('/edit',auth.isLogin,adminController.Edit);




adminRoute.get('/products',auth.isLogin,adminController.loadProducts)
adminRoute.get('/addProduct',auth.isLogin,adminController.loadAddProduct)
adminRoute.post('/addProduct',auth.isLogin,upload.array('files', 4),adminController.insertProduct)
adminRoute.post('/unlist-product',auth.isLogin,adminController.unlistProduct)
adminRoute.post('/list-product',auth.isLogin,adminController.listProduct)
adminRoute.get('/productedit',auth.isLogin,adminController.loadproductedit)
adminRoute.delete('/deleteimg',auth.isLogin,adminController.deleteimg)
adminRoute.post('/productedit',auth.isLogin,upload.array('files', 4),adminController.editproduct)



adminRoute.get('/orders',auth.isLogin,adminController.loadOrders)
adminRoute.get('/orderDetail',auth.isLogin,adminController.loadOrderDetail)
adminRoute.put('/updateStatus',auth.isLogin,adminController.setSatus)

adminRoute.get('/takeOrders',auth.isLogin,adminController.chartdata)


adminRoute.get('/salesReport',auth.isLogin,adminController.loadSalesReport)
adminRoute.get('/salesReportData',auth.isLogin,adminController.reportData)
adminRoute.get('/dwnldReport',auth.isLogin,adminController.dowloadReport)

adminRoute.get('/offers',auth.isLogin,adminController.loadOffers)
adminRoute.get('/addOffer',auth.isLogin,adminController.loadaddOffer)
adminRoute.post('/setOffer',auth.isLogin,adminController.setOffer)

adminRoute.post('/productOffer',auth.isLogin,adminController.setProductOffer)
adminRoute.post('/removeOffer',auth.isLogin,adminController.removeOfferFromProduct)

adminRoute.post('/applyOfferToCategory',auth.isLogin,adminController.setCategoryOffer)
adminRoute.post('/removeOfferCategory',auth.isLogin,adminController.removeCategoryOffer)

adminRoute.get('/coupons',auth.isLogin,adminController.loadCouponPage)
adminRoute.post('/addCoupon',auth.isLogin,adminController.addCoupon)

module.exports = adminRoute;