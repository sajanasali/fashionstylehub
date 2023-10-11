const Coupon=require('../models/coupenModel')
const User=require('../models/userModel')
const moment=require('moment')




const loadCoupon=async(req,res)=>{
    try{
        const coupon = await Coupon.find();
        console.log("coupen",coupon)
        const now = moment();
        const couponData = coupon.map((cpn) => {
            const formattedDate = moment(cpn.expiryDate).format('MMMM D, YYYY');

            return {
                ...cpn,
                expiryDate: formattedDate
            }
        });
        res.render('coupon', { couponData });

    }
    catch(err){
        console.log(err)
    }
}

const  addCoupon=async(req,res)=>{
    try{

        let couponMsg = "";
      let couponExMsg = "";

      if (req.session.coupon) {
        couponMsg = "Coupon added successfully..!!";
        req.session.coupon = false;
      } else if (req.session.exCoupon) {
        couponExMsg = "Coupon already exists..!!";
        req.session.exCoupon = false;
      }
      res.render("addNewcoupon", { couponMsg, couponExMsg });
    }
    catch(err){
        console.log(err)
    }
}

const postAddcoupon=async(req,res)=>{

    try{
       const {code,expDate,percent}=req.body;
       const cpnExst=await Coupon.findOne({code:code})
       if(!cpnExst){
          const coupon=new Coupon({
            code:code,
            discount: percent,
            expiryDate: expDate

          })
          await coupon.save(); 
          req.session.coupon = true;
          res.redirect("/admin/addNewcoupon");
        } else {
          req.session.exCoupon = true;
          res.redirect("/admin/addNewcoupon");
        }

       }
    
    catch(err){
        console.log(err)
    }

}

const deleteCoupon=async(req,res)=>{

    try{
        
         const id=req.query.id;
         await Coupon.findByIdAndDelete(id)
         res.redirect('/admin/coupon')

    }
    catch(err){

        console.log(err)
    }
}
module.exports={

    loadCoupon,
    addCoupon,
    postAddcoupon,
    deleteCoupon
}