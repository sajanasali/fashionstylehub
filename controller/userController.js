const User=require("../models/userModel")
const bcrypt = require("bcrypt");

const Product=require("../models/productModel")
const  Category=require('../models/categoryModel')
const argon2 = require('argon2');
const session = require('express-session');
const nodemailer=require("nodemailer");
const Banner = require("../models/bannerModel");
require('dotenv').config()

let userRegData 
const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (err) {
      console.log(err.message);
    }
  };
  let otp = `${Math.floor(1000 + Math.random() * 9000)}`


  const sendMail=async(name,email)=>{
    try{
   const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLSL:true,
    auth:{
      user:'sajanasali1990@gmail.com',
      pass:'nsmrarfokufrkfwk'
    },
    tls: {
      rejectUnauthorized: false
    }
   });

   const mailOptions={
    from:'sajanasali1990@gmail.com',
    to:email,
    subject:"For Verification mail",
    text:`Hello ${name} Your OTP ${otp}`
   }
   transporter.sendMail(mailOptions,function(error,info){
    if(error){
      console.log(error.message)
    }else{
      console.log("Email has been sent:",info.response);
    }
    return otp
   })
    }
    catch(err){
        console.log(err.message)
    }
  }
  
const loadRegister = async (req, res) => {
    try {
      res.render("signUp");
    } catch (err) {
      console.log(err.message);
    }
  };
  const insertUser = async (req, res) => {

    try {

       console.log(req.body)
       const { name, email } = req.body;
        userRegData = req.body;
        console.log(userRegData);
        //    userRegData.password = userRegData.password[0]

        const existUser = await User.findOne({ email: email })
        // req.session.userRegData = userRegData
        console.log(existUser, 911);
        if (existUser == null) {
          sendMail(name, email)
            res.redirect('/otpVerification')
        } else {
            if (existUser.email == email) {
                res.render('signUp', { message: "User already Exits" })
            }
        }
    }
  
    catch (error) {
        console.log(error.message);
    }
} 
  

  const loginLoad = async (req, res) => {
    try {
      res.render("login");
    } catch (err) {
      console.log(err.message);
    }
  };
  const loginVerify = async (req, res) => {
    try {
      let email = req.body.email;
      let password = req.body.password;

      const userData = await User.findOne({ email: email });


      //   const categories = await Category.find();
      console.log(req.body);
      if (userData) {
          var passwordMatch = await argon2.verify(userData.password, password);
          // let passwordMatch = await securePassword(userRegData.password,password)
          console.log(password);
          console.log(passwordMatch);

          if (passwordMatch) {
              const is_blocked = userData.is_blocked;
              if (!is_blocked) {
                  req.session.userdata = userData;
                  // const session = req.session.userdata
                  res.redirect("/shop"); //
              } else {
                  res.render("login", {
                      //   categories,
                      message: "Unauthorised access",
                  });
              }
          } else {
              res.render("login", {
                  // categories,
                  message: "Password is incorrect",
              });
          }
      } else {
          res.render("login", {
              //   categories,
              message: "Email or Password is incorrect",
          });
      }
      // }
  } catch (error) {
      console.log(error.message);
  }
  };
  // const shop=async(req,res)=>{
  //   try {
  //     res.render("shop");
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // }
  
const getotp = (req, res) => {
  try {
      res.render('otpVerification');
  } catch (error) {
      console.log(error.message);
  }
}

const verifyOtp = async (req, res) => {
  try {
      const walletValue = userRegData.wallet || 0;
      const password = await argon2.hash(userRegData.password);
      const enteredotp = req.body.otp;

      if (otp == enteredotp) {
          const user = new User({
              name: userRegData.name,
              email: userRegData.email,
              mobile: userRegData.mobile,
              password: password,
              is_blocked: false,
              is_verfied: false,
              wallet: walletValue
          });
          const userData = await user.save();
          //console.log(userData);
          
          res.redirect('login');
      } else {
          res.render('otpVerification', { message: "Invalid OTP" });
      }
  } catch (error) {
      console.log(error.message);
  }
};
let email1
const verifyemail = async (req, res) => {
    email1 = req.body.email
    console.log(email1);
    const exist = await User.find({ email: email1 })
    try {
        if (exist) {
            console.log('existtttttttt')
            sendMail(email1)
            res.render('otpforgotpassword')
        } else {
            res.redirect('/forgotpassword')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const listProduct = async (req, res) => {
 

  try {
       const product=await Product.find({unlist:false});
       const category=await Category.find();
       const user=await User.find();
       res.render('shop',{product,user,category})
     
} 
catch(err){
  console.log(err)
}    
      
}
const logout = async (req, res) => {
  try {
      req.session.destroy();
      res.redirect('/login')
  } catch (error) {
      console.log(error.message);
  }
}

const ProductView = async (req, res) => {
  try {
      
      const proData = await Product.findOne({ _id: req.params.id });
console.log(proData,'prodataaa')
      if (req.session.userdata) {
          const user = req.session.userdata
          const userData = await User.findById({ _id: user._id })

          res.render('productDetails', { proData, userData })
      } else {
          res.render('productDetails', { proData })
      }
  } catch (error) {
      console.log(error);
  }
}


const searchProducts = async (req, res) => {
  try {
    var search='';
    var cat_search="";
    const category=await Category.find({})
    if(req.query.search){
      search=req.query.search;
    }
    if(req.query.category){
      cat_search=req.query.category;
      console.log(cat_search)
    }
    // const productData=await Product.find({
    //   $and:[
    //     {Category:cat_search},
    //   {name:{$regex:'.*'+search+'.*',$options:'i'}}
      
    //   ]
    // })
    let productQuery = {
      name: { $regex: '.*' + search + '.*', $options: 'i' }
    };
    if (cat_search) {
      productQuery.category = cat_search; // Add category filter if it's specified
    }
    const productData = await Product.find(productQuery)
      .populate('category'); 
    
    res.render('shop',{product:productData,category})  
  } catch (error) {
      console.log(error.message)
  }
}
const changePassword=async(req,res)=>{
  try{
     res.render('changePassword')
  }
  catch(error){
    console.log(error)
    return  res.status(500).render('error', { error, status: 500 });
  }
}
const resetpassword = async (req, res) => {
  const password = await argon2.hash(req.body.password);
  const user = req.session.userdata
  const userData = await User.findById({ _id: user._id })
  const userId = userData._id
  console.log("from resetpassword")
  try {
      const userdata = await User.findOneAndUpdate({
        _id: userId 
      }, { $set: { password: password } }, { new: true })
      res.redirect('/login')
  } catch (error) {
      console.log(error.message)
      return  res.status(500).render('error', { error, status: 500 });
  }
}
const home=async(req,res)=>{

  try{

    const user=req.session.userdata
    
    const proData=await Product.find()
    const catData=await Category.find()
    const banner=await Banner.find()
    const userId = user?._id;

    if(userId){
      const userData = await User.findById(userId);
      res.render('home',{userData,proData,catData,banner})
    }
    else{
      res.render('home',{proData,catData,banner})
    }
     
  }
  catch(error){
    console.log(error)
    return  res.status(500).render('error', { error, status: 500 });
  }
}

const wallet=async(req,res)=>{

  try{
    const user = req.session.userdata
   
    console.log(user);
    res.render('wallet',{user})
  }
  catch(err){
    console.log(err)
  }
}
  module.exports={
    loadRegister,
    insertUser,
    verifyemail,
    loginLoad,
    loginVerify,
    ProductView ,
      sendMail,
      listProduct,
      getotp,
      verifyOtp,
      logout,
      searchProducts,
     
      changePassword,
      resetpassword,
      home,
      wallet
  }

  