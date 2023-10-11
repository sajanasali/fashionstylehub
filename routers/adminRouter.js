const express=require('express')
const admin_route=express()
const adminController=require('../controller/adminController')
const productController=require("../controller/productController")
const categoryController=require("../controller/categoryController")
const couponController=require('../controller/couponController')



const multer=require("multer")
const fs = require('fs');
const path = require('path')

const config=require('../config/config')
const session=require("express-session");
admin_route.use(express.json());
admin_route.use(express.urlencoded({extended:true}))
admin_route.use('/images', express.static('/public'));
admin_route.set("view engine", "hbs");
admin_route.set('views','./views/admin');

admin_route.use( express.static(path.join(__dirname, '../public')))

admin_route.use(session({secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true}));

//multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage });




    //login page
admin_route.get('/login',adminController.loginLoad )
admin_route.post('/login',adminController.loginVerify)
admin_route.get('/dashboard',adminController.dashBoard)
admin_route.get('/logout',adminController.logout)
//category
admin_route.get('/addcategory',categoryController.getAddcategory)
admin_route.post('/addcategory',categoryController.insertCategory)
admin_route.get('/category',categoryController.loadcategory) 
admin_route.get('/editcategory/:id',categoryController.loadEditcategory)
admin_route.post('/editcategory/:id',categoryController.updatecategory)  
admin_route.post('/delete/:id',categoryController.deleteCategory) 

//list or unlist category
admin_route.get('/unlistcat',adminController.unlistCategory)
admin_route.get('/listcat',adminController.listCategory)
                                                                     
//product
admin_route.get('/product',productController.getaddProduct);
 admin_route.post('/product',upload.array('image',5),productController.addProduct);
 admin_route.get('/productpage',productController.loadProduct)
 admin_route.get('/productImage',productController.productImage)

 admin_route.get('/editProduct/:id',productController.getEditproduct)
 admin_route.post('/editProduct/:id',upload.array('image',5),productController.productUpdate)
 //list or unlist product
 admin_route.get('/unlist',adminController.unlistProduct)
 admin_route.get('/list',adminController.listProduct)

//block or unblock
admin_route.get('/userlist',adminController.userList)
admin_route.get('/blockUser',adminController.blockUser)
admin_route.get('/unblockUser',adminController.unblockUser)
//search
admin_route.get('/searchingProducts',adminController.searchProducts)
admin_route.get('/catadSearch',adminController.catSearch)


//orders
admin_route.get('/orders',adminController.getOrder)
admin_route.get('/order_Details',adminController.orderdetails)
admin_route.post('/change_status',adminController.changeOrderStatus)

//coupon
admin_route.get('/coupon',couponController.loadCoupon)
admin_route.get('/addNewcoupon',couponController.addCoupon)
admin_route.post('/addNewcoupon',couponController.postAddcoupon)
admin_route.get('/deleteCoupon',couponController.deleteCoupon)

//banner
admin_route.get('/add_banner',adminController.addbanner)
admin_route.post('/add_banner',upload.single('image'),adminController.loadAddbanner)
admin_route.get('/banner',adminController.banner)
admin_route.post('deletebanner/:id',adminController.deleteBanner)

//salesreport
admin_route.post('/dailysales',adminController.dailySales)
admin_route.post('/daily',adminController.daily)
admin_route.get('/dailysales/download',adminController.dailyDownload)
admin_route.post('/monthlysales',adminController.monthlysales)
admin_route.get('/monthlysales/download',adminController.monthlyDownload)
admin_route.post('/dailycancel',adminController.dailycancel)
admin_route.post('/monthlycancel',adminController.monthlycancel)
 admin_route.get('/dailycancels/download',adminController.dailycancelDownload)
 admin_route.get('/monthlycancels/download',adminController.monthlycancelDownload)

 //stock report
 admin_route.post('/dailystock',adminController.dailyStock)
 admin_route.get('/dailystock/download',adminController.dailystockDownload)
 admin_route.post('/dayReport',adminController.dayData)
module.exports=admin_route;