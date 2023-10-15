const express=require('express')
const user_route=express();
const config=require('../config/config')
const cookieParser = require('cookie-parser');
const session=require("express-session");
const auth=require('../middleware/userAuth')
const userController=require('../controller/userController')
const cartController=require('../controller/cartController')
const profileController=require('../controller/profileController')
const checkoutController=require("../controller/checkoutController")
const orderController=require("../controller/orderController")
const nocache = require("nocache");
const counts=require('../middleware/counts')


const productController=require("../controller/productController")
const path=require('path');
//user_route.use( '/css',express.static(path.join(__dirname, '../public')))
//user_route.use( '/images',express.static(path.join(__dirname, '../public')))
user_route.use(nocache())
user_route.use(express.static(path.join(__dirname,'../public')));
user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))
user_route.use(cookieParser());
user_route.use(session({secret:config.sessionSecret,                                                                                                             
    resave:false,
    saveUninitialized:true}));
user_route.set("view engine", "hbs");
user_route.set('views','./views/user');
user_route.use(counts.cartnum)

//registration
user_route.get('/signUp',userController.loadRegister)
user_route.post('/signUp',userController.insertUser)
//user_route.get('/verify',userController.verifyMail)
//login
user_route.get('/login',userController.loginLoad)
user_route.post('/login',userController.loginVerify)

//otp 
user_route.get('/otpverification',userController.getotp);
user_route.post('/otpverification', userController.verifyOtp);
//session home
user_route.get('/home',userController.home)
user_route.get('/',userController.home)
user_route.get('/logout',userController.logout)


//products
user_route.get('/shop',nocache(),userController.listProduct)
user_route.get('/productDetails/:id',userController.ProductView)
user_route.get('/searchProducts',userController.searchProducts)

user_route.get('/imageUser',productController.productImageuser)

//cart
user_route.get('/cart',auth.isLogin,cartController.cartLoad)
user_route.get('/add_to_cart',auth.logedin,cartController.addtocart)
user_route.get('/remove',auth.isLogin,cartController.removeCart)
user_route.post('/cart_updation',auth.logedin,cartController.updateCart)

//profile
user_route.get('/profile',profileController.loadProfile)
user_route.get('/manage_address',profileController.manageAddress)
user_route.get('/addaddress',profileController.addNewAddress)
user_route.post('/addnewaddress',profileController.setAddress)
user_route.get('/delete_address/:id',profileController.deleteAddress)
user_route.get('/edit_address/:id',profileController.loadeditaddress)
user_route.post('/edit_address/:id',profileController.editaddress)
user_route.get('/changePassword',userController.changePassword)
user_route.post('/resetpassword',userController.resetpassword)

//checkout
user_route.get('/checkout',auth.isLogin,checkoutController.loadCheckout)
user_route.get('/check_stock',auth.isLogin,checkoutController.checkStock)
user_route.post("/place_order",auth.isLogin,checkoutController.placeOrder)
user_route.post('/validate_coupon',checkoutController.validateCoupon)

// checkaddress

user_route.get('/addCheckoutaddress',checkoutController.addNewAddresss)
user_route.post('/addCheckoutaddress',checkoutController.checkoutsaveaddress)
//wallet
user_route.get('/wallet',userController.wallet)

//order
user_route.get('/order_success',orderController.orderSuccess)
user_route.get('/order_Details',orderController.orderDetails)
user_route.get('/my_orders',orderController.myOrders)
user_route.post('/orderCancel',orderController.orderCancel)
user_route.post('/orderreturn',orderController.orderReturn)
user_route.get('/get_invoice',orderController.getInvoice)

//error

module.exports=user_route;