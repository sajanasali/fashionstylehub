const User=require("../models/userModel")
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const Swal = require('sweetalert2')
//const Cart=require("../models/cartModel")

const addtocart=async(req,res)=>{
   
  try {
   
    const user = req.session.userdata;
    const userData = await User.findById({ _id: user._id });
    const userId = userData._id;

    const proId = req.query.id;
    //console.log(proId)
    const product = await Product.findById(proId);
    //console.log("product",product)
    const existed = await User.findOne({ _id: userId, 'cart.product': proId });

    if (product.quantity < 1) {
      res.json({ message: 'Out of stock. Cannot add to cart.' });
      return; // Stop the function execution here if the product is out of stock
    }

    if (existed) {
      await User.findOneAndUpdate(
        { _id: userId, 'cart.product': proId },
        { $inc: { 'cart.$.quantity': 1 } },
        { new: true }
      );
      res.json({ message: 'Item already in cart' });
    } else {
      await Product.findByIdAndUpdate(proId, { isOnCart: true });
      await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { product: product._id } } },
        { new: true }
      );
      res.json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.log(error.message);
  }

}





const cartLoad = async (req, res) => {
  try {
    //const userId = req.query.id
    //console.log(userId);
    const user1 = req.session?.userdata
    const userData = await User.findById({ _id: user1._id })

    const user = await User.findOne({ _id: user1._id }).populate('cart.product').lean()
    const cart = user?.cart; // Get the 'cart' array from the user document

    console.log(cart, 'cartttt......................')

    let subTotal = 0
    cart.forEach((val) => {
      val.total = val.product.price * val.quantity
      subTotal += val.total
    })


    if (user.cart.length === 0) {
      res.render('emptyCart', { userData })
    } else {
      res.render('cart', { userData, cart, subTotal })
    }
  } catch (error) {
    console.log(error.message)
    console.log("cartcatch")
  }
}
    
const removeCart = async (req, res) => {
  try {
    const user = req.session.userdata
    const userData = await User.findById({ _id: user._id })
    const userId = userData._id;
    const proId = req.query.proId;
    const cartId = req.query.cartId;

    await Product.findOneAndUpdate(
      { _id: proId, isOnCart: true }, // Ensure the product is still in the cart
      { $set: { isOnCart: false } },
      { new: true }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: proId } } }
    );
      
    res.json('item removed');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
  }
};

const updateCart = async (req, res) => {
  try {
    console.log("updatecart")
    const user = req.session.userdata
    console.log("user",user)
    const userData = await User.findById({ _id: user._id })
    console.log("Userdata",userData)
    let data = await User.find(
      { _id: userData._id },
      { _id: 0, cart: 1 }
    ).lean();
       console.log( "updatecart",data)
    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
   
      console.log("new quantity",val.quantity)
    });

    await User.updateOne(
      { _id: userData._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message)
  }
};






module.exports={
    cartLoad,
    addtocart,
    removeCart,
    updateCart
}