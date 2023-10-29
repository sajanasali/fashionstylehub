const userModel = require("../models/userModel")


const cartnum=async(req,res,next)=>{

try{
    //console.log("middleware starting")
    const user1 = req.session?.userdata
      if(user1){
        
            console.log("if condition") 

        const user = await userModel.findOne({ _id: user1._id }).populate('cart.product').lean()
        console.log("user",user)
       res.locals.cartcount=user.cart
         
      }
     
    
}
catch(err){
    console.log(err)
}
finally{
    next()
}

}
module.exports={
    cartnum
}