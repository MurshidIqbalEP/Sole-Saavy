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


adminRoute.get('/', adminController.loadAdminLogin);
adminRoute.post('/',adminController.loadDashboard)

adminRoute.get('/logout',auth.isLogin,adminController.adminLogOut)

adminRoute.get('/Dashboard',auth.isLogin,adminController.loadHome);

adminRoute.get('/customers',adminController.loadCustomers);
adminRoute.post('/block-user',adminController.loadBlockUser);
adminRoute.post('/unBlock-user',adminController.loadunblockUser);

adminRoute.get('/category',adminController.loadCategory);
adminRoute.post('/category',adminController.addCategory);
adminRoute.post('/unlist-category',adminController.unlistCategory);
adminRoute.post('/list-category',adminController.listCategory);
adminRoute.get('/edit',adminController.loadEdit);
adminRoute.put('/edit',adminController.Edit);




adminRoute.get('/products',adminController.loadProducts)
adminRoute.get('/addProduct',adminController.loadAddProduct)
adminRoute.post('/addProduct',upload.array('files', 4),adminController.insertProduct)
adminRoute.post('/unlist-product',adminController.unlistProduct)
adminRoute.post('/list-product',adminController.listProduct)
adminRoute.get('/productedit',adminController.loadproductedit)
adminRoute.delete('/deleteimg',adminController.deleteimg)
adminRoute.post('/productedit',upload.array('files', 4),adminController.editproduct)
adminRoute.get('/crop',adminController.cropImage)



adminRoute.get('/orders',adminController.loadOrders)
adminRoute.get('/orderDetail',adminController.loadOrderDetail)
adminRoute.put('/updateStatus',adminController.setSatus)






module.exports = adminRoute;