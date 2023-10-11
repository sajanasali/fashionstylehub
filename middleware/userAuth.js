const User = require('../models/userModel');
const isLogin = async (req, res, next) => {
  try {
    if (req.session.userdata) {
     
    } else {
      res.redirect('/')
    }

  } catch (error) {
    console.log(error.message);
  }
  finally{
    next()
}
}
const isLogout = async (req, res, next) => {
  try {
    if (req.session.userdata) {
     
    } else {
      res.redirect('/home')
    }
  } catch (error) {
    console.log(error.message);
  }
  finally{
    next()
}
}

const logedin = async(req, res, next)=>{
  try {

      if(!req.session.userdata){
          res.redirect('/login')
      }else{
          next()
      }
      
  } catch (error) {
      console.log(error.message);
  }
  finally{
    console.log("islogedin middleware executed")
}

}

const checkBlocked = async (req, res, next) => {
  const userid = req.session.userdata._id
  const userdata = await User.findOne({ _id: userid })
  if (userdata && userdata.is_blocked == true) {
    res.session.destroy()
    return res.redirect('/login')
  }
  return next()
}
module.exports = {
  isLogin,
  isLogout,
  checkBlocked,
  logedin
}