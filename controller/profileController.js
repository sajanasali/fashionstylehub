const User=require("../models/userModel")
const address=require("../models/addressModel")



  const loadProfile = async (req, res) => {
    try {
        const userId = req.session.userdata._id;
        const userData = await User.findById(userId)
          const Address=await
        res.render('profile', { userData })
    } catch (error) {
        console.log(error.message)
        return  res.status(500).render('error', { error, status: 500 });
    }
}
const manageAddress = async (req, res) => {
    try {
        const userData = req.session.userdata
        const id = userData._id
        const userAddress = await address.find({ userId: id })
        res.render('manage_address', { userAddress, userData })

    } catch (error) {
        console.log(error.message)
        return  res.status(500).render('error', { error, status: 500 });
    }
}
const addNewAddress = async (req, res) => {
  try {
      const userData = req.session.userdata

      res.render('addAddress', { userData })
  } catch (error) {
      console.log(error.message)
      return  res.status(500).render('error', { error, status: 500 });
  }
}
const setAddress=async(req,res)=>{
    try{
        const userData = req.session.userdata;
        const id = userData._id
        const Address = new address({
            userId: id,
            name: req.body.name,
            mobile: req.body.mobile,
            adressLine1: req.body.address1,
            adressLine2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            is_default: false
        })
        await Address.save();
        res.redirect('/profile')
    }
    catch(error){
        console.log(error.message)
        return  res.status(500).render('error', { error, status: 500 });
    }
}
const deleteAddress = async (req, res) => {
    try {
        const _id = req.params.id

        await address.findByIdAndDelete(_id)
        res.redirect('/manage_address')
    } catch (error) {
        console.log(error);
        return  res.status(500).render('error', { error, status: 500 });
    }
}
const loadeditaddress = async (req, res) => {
    try {
        const userData = req.session.userdata;
        const addressId = req.params.id
        
        const Address = await address.findById(addressId)
        res.render('edit_address', { userData, Address })
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
}

const editaddress = async (req, res) => {
    try {
        const id = req.params.id
        console.log("id",id);
        const userid = req.session.userdata._id
        const userData = await User.findById(userid)
        console.log(userData,1499)
        const addressData = await address.findById(id)
        console.log(addressData,151);
        
            const updatedData={
                name: req.body.name,
                mobile: req.body.mobile,
                adressLine1: req.body.address1,
                adressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
                is_default: false
            }
            console.log("updatedata",updatedData)
            address.findByIdAndUpdate(
                id,
                {$set:{updatedData}}
                ,
                
                {new:true}
                
            )
        
        res.redirect('/manage_address')

    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
}
module.exports={
    loadProfile,
    addNewAddress,
    setAddress,
    manageAddress,
    deleteAddress,
    loadeditaddress,
    editaddress
}