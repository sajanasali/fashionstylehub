const User=require("../models/userModel")
const Product=require("../models/productModel")
const Address=require("../models/addressModel")
const Order=require("../models/orderModel")
const moment = require("moment");
const easyinvoice = require('easyinvoice');
const hbs = require('hbs');
const Swal = require('sweetalert2')
const myOrders = async (req, res) => {
    try {



        const PAGE_SIZE = 10; // Number of items per page
        const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
        const totalOrders = await User.countDocuments();

        const totalPages = Math.ceil(totalOrders / PAGE_SIZE);
        const skip = (page - 1) * PAGE_SIZE;


        const userData = req.session.userdata;
        const userId = userData._id

        // console.log(userData, "From orderDetails")
        const orders = await Order.find({ userId }).sort({ date: -1 }).skip(skip).limit(PAGE_SIZE);
         const couponData=orders.coupon;

        const formattedOrders = orders.map(order => {
            const formattedDate = moment(order.date).format('MMMM ,D,YYYY');
            return { ...order.toObject(), date: formattedDate }
        })

        // console.log("orders" + orders)

        res.render('my_orders', {
            userData,
            myOrders: formattedOrders || [],
            currentPage: page,
            totalPages: totalPages,
            itemsPerPage: PAGE_SIZE,
            couponData
        })
    } catch (error) {
        console.log(error.message)
    }
}

const orderSuccess = (req, res) => {
    try {
        const userData = req.session.userdata
        res.render('order_success', { userData })
    } catch (error) {
        console.log(error.message);
    }
}

hbs.registerHelper("eq", function (a, b) {
    return a === b;
});
hbs.registerHelper("addOne", function (value) {
    return value + 1;
});
hbs.registerHelper("noteq", function (a, b) {
    return a !== b;
});
hbs.registerHelper("or", function (a, b) {
    return a || b;
});


const orderDetails = async (req, res) => {
    try {
        const userData = req.session.userdata;
        const orderId = req.query.id;

        const myOrderDetails = await Order.findById(orderId);
        const orderedProDet = myOrderDetails.product;
        const couponData=myOrderDetails.coupon;
         console.log("coupon data",couponData)
        const discountAmt=myOrderDetails.discountAmt;
        const addressId = myOrderDetails.address;
        const address = await Address.findById(addressId)
        res.render('order_Details', { myOrderDetails, orderedProDet, userData, address,couponData,discountAmt });

    } catch (error) {
        console.log(error.message)
    }
}


const getInvoice = async (req, res) => {
    try {
        const orderId = req.query.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        const { userId, address: addressId } = order;

        const [user, address] = await Promise.all([
            User.findById(userId),
            Address.findById(addressId),
        ]);
         
        const products = order.product.map((product) => ({
            quantity: product.quantity,
            description: product.name,
            "tax-rate":10,
            price: product.price,

        }));

        const date = moment(order.date).format('MMMM ,D, YYYY');
               console.log("date",date)
        if (!user || !address) {
            return res.status(404).send({ message: 'User or address not found' });
        }

        const filename = `invoice_${orderId}.pdf`;

        const data = {
            currency: 'INR',
           
            taxNotation: 'vat',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
            // Your own data
            sender: {
                company: 'Fashion HUB',
                address: '123 Street, Pathanamthitta, Thiruvalla',
                zip: '689103',
                city: 'Thiruvalla',
                country: 'India',
            },
            // Your recipient
            client: {
                company: user.name,
                address: address.adressLine1,
                zip: address.pin,
                city: address.city,
                country: 'India',
            },

            information: {
               
                number: "2023.0001",
               
                date: date,
               
            },
            products: products,
             
        };

        // easyinvoice.createInvoice(data, function (result) {
               console.log("data",data)
        easyinvoice.createInvoice(data, function (result) {
            const fileName = 'invoice.pdf'
            const pdfBuffer = Buffer.from(result.pdf, 'base64');
           
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
            res.send(pdfBuffer);
        })
        console.log('PDF base64 string: ');
        // });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};


const orderCancel = async (req, res) => {
    try {
        console.log("hello fronm order ");      
        const userId = req.session.userdata._id;
        const userData = await User.findById(userId)
        const orderId = req.body.id
        const qty=req.body.quantity;
        console.log(qty)
        const orderData = await Order.findById(orderId)
        const paymentMethod = orderData.paymentMethod
        //const quantityupdate=
        const currentBalance = userData.wallet

        const refundAmount = orderData.total;

         const updateTotalAmount = currentBalance + refundAmount
         console.log(updateTotalAmount, 146666);
         if (paymentMethod === 'wallet'){

         
            const updatewalletAmount = await User.findByIdAndUpdate(

                userData._id,
                { $set: { wallet: updateTotalAmount } },
                { new: true })

         }
         if (paymentMethod === 'razorpay'){

         
            const updatewalletAmount = await User.findByIdAndUpdate(

                userData._id,
                { $set: { wallet: updateTotalAmount } },
                { new: true })

         }
        
         
       
        const { id } = req.body;
        const updatedData = await Order.findByIdAndUpdate(
            { _id: id },
            { status: "Cancelled"  },
            { new: true }
        );
        for (const productItem of orderData.product) {
            const productId = productItem.id;
            const quantityToRestore = productItem.quantity;
      
            // Update the product quantity based on its ID
            const updatedProduct = await Product.findByIdAndUpdate(
              productId,
              { $inc: { quantity: quantityToRestore } },
              { new: true }
            );
            }
        res.json(updatedData);
    } catch (error) {
        console.log(error.message);
    }
};
// Return Order
const orderReturn = async (req, res) => {
    try {

        const userId = req.session.userdata._id;
        const userData = await User.findById(userId)
        const orderId = req.body.id

        const orderData = await Order.findById(orderId)
        const paymentMethod = orderData.paymentMethod
        const currentBalance = userData.wallet
        const refundAmount = orderData.total;

        const updateTotalAmount = currentBalance + refundAmount
        console.log(updateTotalAmount, 182222);


        const updatewalletAmount = await User.findByIdAndUpdate(

            userData._id,
            { $set: { wallet: updateTotalAmount } },
            { new: true })

        console.log("order completed");
        const { id } = req.body;
        const updatedData = await Order.findByIdAndUpdate(
            id,
            { status: 'Returned' },
            { new: true }
        );
        for (const productItem of orderData.product) {
            const productId = productItem.id;
            const quantityToRestore = productItem.quantity;
      
            // Update the product quantity based on its ID
            const updatedProduct = await Product.findByIdAndUpdate(
              productId,
              { $inc: { quantity: quantityToRestore } },
              { new: true }
            );
            }
            console.log("quantity returned")
        res.json(updatedData);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports={
    orderSuccess,
    myOrders,
    orderDetails,
    getInvoice,
    orderCancel,
    orderReturn
}