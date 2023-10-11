const User=require("../models/userModel")
const admin=require("../models/adminModel")
const bcrypt = require("bcrypt");
const hbs = require('hbs');
const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const moment = require("moment");
const Order=require("../models/orderModel")
const Address=require("../models/addressModel")
const Banner=require('../models/bannerModel')
const ExcelJS = require('exceljs');
const { errorMonitor } = require("nodemailer/lib/xoauth2");
//const randomstring = require("randomstring");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};
//login admin methods started
const loginLoad = async (req, res) => {
    try {
      res.render("login");
    } catch (err) {
      console.log(err.message);
    }
  };

  
  const loginVerify = async (req, res) => {
    try {
      //admin dahboard

      const email = req.body.email;
      const password = req.body.password;


      const adminData = await admin.findOne({ email: email })
      console.log(adminData);
      // console.log(password);

      if (adminData) {
          if (password == adminData.password) {
              req.session.adminLogin = true;
              req.session.admin = adminData;
              console.log("hello")
              
              res.redirect('/admin/dashboard')
            

          } else {
              res.render('login.hbs', ({ messageErr: 'Please check your password' }))
          }
      } else {
          res.render('login.hbs', ({ message: `email dosen't exist` }))
      }
  } catch (error) {
      console.log(error.message);
  }
}
   
  const blockUser = async (req, res) => {
    try {

        const userData = await User.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { is_blocked: true } }
        );
        console.log(userData);
        res.redirect("userlist");
    } catch (error) {
        console.log(error.message);
        return  res.status(500).render('error', { error, status: 500 });
    }
};
const unblockUser = async (req, res) => {
  try {
      const userData = await User.findOneAndUpdate(
          { _id: req.query.id },
          { $set: { is_blocked: false } }
      );
      console.log(userData);
      res.redirect("userlist");
  } catch (error) {
      console.log(error.message);
      return  res.status(500).render('error', { error, status: 500 });
  }
};


let dailyorders;
let totalOrderBill;
let monthlyOrders;
let totalMonthlyBill;
let yearlyorders;
let totalYearlyBill;

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

// const dashBoard=async(req,res)=>{
// try{

//   res.render('dashboard')
// }
// catch(err){
//   console.log(err)
// }
// }
const dashBoard = async (req, res) => {
  try {
    const users = await User.find({}).count();
    const products = await Product.find({}).count();
    const orders = await Order.find({}).count();
    const allOrders = await Order.find({ status: "Delivered" });
    const totalRevenue = allOrders.reduce((totall, order) => totall + Number(order.total), 0);


    // const delivered = await Order.find({ status: 'Delivered' })
    // console.log(delivered,'delivered')


    const orderdata = await Order.aggregate([
      {
        $sort: {
          "date": 1,
        }
      },
      {
        $group: {
          _id: {
            $month: "$date"
          },
          orders: {
            $push: "$$ROOT"
          }
        }
      },

      {
        $project: {
          _id: 0,
          month: "$_id",
          orders: 1
        }
      },
      {
        $sort: {
          "month": 1
        }
      }
    ])

    // console.log(orderdata,75555)

    const ordersnum = []
    orderdata.forEach(element => {
      const num = element.orders.length
      ordersnum.push(num)
    });

    const ordermonth = []
    orderdata.forEach(element => {
      const num = element.month
      ordermonth.push(num)
    });
    // console.log(ordermonth, 8999999)

    const monthNames = ordermonth.map(monthNumber =>
      new Date(0, monthNumber - 1).toLocaleString('default', { month: 'long' })
    );
    // console.log(monthNames, "monthnamessss")


    // category sales
    const categorysale = await Order.aggregate([
      {
        $lookup: {
          from: "products", // Name of the collection joining with
          localField: "product.id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories", // Name of the collection joining with
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          category: "$category.name",
          count: 1,
        },
      },
    ]).exec();

    const cashOnDeliveryCount = await Order.countDocuments({
      paymentMethod: "cash-on-delivery",
    });

    const razorpayCount = await Order.countDocuments({
      paymentMethod: "razorpay",
    });

    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          count: 1,
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ];
    // console.log(pipeline, "pipelineeeeeeeee")
    const ordersByMonth = await Order.aggregate(pipeline).exec();
    // console.log(ordersByMonth, 132222)

    const orderCounts = ordersByMonth.map(({ date, count }) => ({
      month: date ? date.toLocaleString("default", { month: "long" }) : null,
      count,
    }));

    // console.log(orderCounts, "OrderCountsssssssssss")
    // console.log(categorysale, "categorysaleeeeeeeeeeee");
    res.render('dashboard', {
      categorysale,
      cashOnDeliveryCount,
      razorpayCount,
      orderCounts,
      users,
      products,
      orders,
      totalRevenue,
      monthNames,
      ordersnum
    });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const dayData = async (req, res) => {
  try {
    const orderDate = moment()
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: { $in: ['pending', 'shipped', 'delivered'] }, 
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          totalSales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    console.log("month");
    const chartData = salesData.map((entry) => ({
      y: moment(entry._id, 'YYYY-MM-DD').format('DD'), // Extract the date as a string
      a: entry.totalSales,
    }));
    res.json({ chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
 const userList = async (req, res) => {
  try {
      const PAGE_SIZE = 10; // Number of items per page
      const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
      const totalUsers = await User.countDocuments();

      const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;
      const userData = await User.find().sort({ name: 1 }).skip(skip).limit(PAGE_SIZE);


      res.render("userlist", {
          userData,
          currentPage: page,
          totalPages: totalPages,
          itemsPerPage: PAGE_SIZE,
      })
  } catch (error) {
      console.log(error.message);
  }
} 
const unlistProduct=async(req,res)=>{
  try{
       const _id=req.query.id
       await Product.findByIdAndUpdate(_id, {
        $set: {
          unlist: true,
        },
      });
      res.redirect("/admin/productpage");     
  }
  catch(err){
    console.log(err.message)
  }
}
const listProduct=async(req,res)=>{
  try{
       const _id=req.query.id
       await Product.findByIdAndUpdate(_id, {
        $set: {
          unlist: false,
        },
      });
      res.redirect("/admin/productpage");     
  }
  catch(err){
    console.log(err.message)
  }
}
const unlistCategory=async(req,res)=>{
  try{
       const _id=req.query.id
       await Category.findByIdAndUpdate(_id, {
        $set: {
          unlist: true,
        },
      });
      res.redirect("/admin/category");     
  }
  catch(err){
    console.log(err.message)
  }
}
const listCategory=async(req,res)=>{
  try{
       const _id=req.query.id
       await Category.findByIdAndUpdate(_id, {
        $set: {
          unlist: false,
        },
      });
      res.redirect("/admin/category");     
  }
  catch(err){
    console.log(err.message)
  }
}
const getOrder = async (req, res) => {
  try {
      const PAGE_SIZE = 10; // Number of items per page
      const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10

      // Fetch the total number of orders from the database to calculate total pages
      const totalOrders = await Order.countDocuments();

      const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

      const skip = (page - 1) * PAGE_SIZE;
      const orders = await Order.find().sort({ date: -1 }).skip(skip).limit(PAGE_SIZE);


      const now = moment();

      const ordersData = orders.map((order) => {
          const formattedDate = moment(order.date).format("MMMM D, YYYY");
          return {
              ...order.toObject(),
              date: formattedDate,
          };
      })
      // console.log(ordersData, 1234);
      res.render("orders", {
          ordersData: orders,
          currentPage: page,
          totalPages: totalPages,
          itemsPerPage: PAGE_SIZE,

      })
  } catch (error) {
      console.log(error.message);
  }
}

const orderdetails = async (req, res) => {
  try {
      const userData = req.session.userdata;
      const orderId = req.query.id;

      const myOrderDetails = await Order.findById(orderId);
      const orderedProDet = myOrderDetails.product;
      const addressId = myOrderDetails.address;

      const address = await Address.findById(addressId);

      res.render("order_Details", {
          myOrderDetails,
          orderedProDet,
          userData,
          address,
      });
  } catch (error) {
      console.log(error.message);
  }
}

const changeOrderStatus = async (req, res) => {
  console.log(req.body);

  try {
      const id = req.query.id;
      const status = req.body.status;

      const order = await Order.findByIdAndUpdate(
          id,
          { $set: { status: status } },
          { new: true }
      );
      res.redirect("/admin/orders");
  } catch (error) {
      console.log(error);
  }
};
const logout = async (req, res) => {
  try {
      req.session.destroy();
      res.redirect('/admin/login')
  } catch (error) {
      console.log(error.message);
  }
}
const searchProducts = async (req, res) => {
  try {
    var search='';
    if(req.query.search){
      search=req.query.search;
    }
    const productData=await Product.find({

      name:{$regex:'.*'+search+'.*',$options:'i'}
    })
    res.render('products',{product:productData})  
  } catch (error) {
      console.log(error.message)
  }
}
const catSearch=async (req,res) =>{
  try{
      console.log("hi from categorysearch") 
      const id=req.query.category
    const categories=await Category.find();
    console.log(categories)
   
    const category=await Category.findById(id);
    console.log("category for filtering",category)
                     
    const productData=await Product.find({category})
    console.log(productData)
    res.render('products',{product:productData,categories,category})
  
  }

  catch(err){
    console.log(err)
  }
}

const addbanner=async(req,res)=>{
try{
res.render('add_banner')

}
catch(err){
  console.log(err)
}

}
const loadAddbanner=async(req,res)=>{
   
  try{

    console.log("msg from banner")
       const image=req.file.filename;
       console.log("image",image)
       const {title,link}=req.body
       const banner=new Banner({
             title:title,
             image:image,
             link:link
       })
       await banner.save();
       console.log("banner added")
       res.redirect('/admin/add_banner')
  }
  catch(err){

    console.log(err)
  }


}
const banner=async(req,res)=>{
try{
  const bannerData=await Banner.find()
   res.render('banner',{bannerData})
}
catch(err){
  console.log(err)
}


}
const deleteBanner=async(req,res)=>{

  try{

    console.log("hello checking banner")
    const id=req.query.id;
    console.log("hello from deletebanner",id)
    await Banner.findByIdAndDelete(id)
    res.redirect('/admin/banner')
  }
  catch(err){

  }
}
const dailySales = async (req, res) => {
  try {
    const orderDate = req.body.daily;
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");

    dailyorders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate("address");
    // console.log(dailyorders, "DailyOrdersssss");
    totalOrderBill = dailyorders.reduce(
      (total, order) => total + Number(order.total),
      0
    );
    // console.log(totalOrderBill, "totalOrderBill");
    res.render('dailysales', { dailyorders, totalOrderBill });
  } catch (error) {
    console.log(error.message);
  }
};
const dailyDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Delivery Name", key: "deliveryName", width: 20 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  dailyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      deliveryName: order.address.name,
      orderDate: order.date,
      discount: order.discount,
      totalBill: order.total,
    });
  });
  worksheet.addRow({
    totalOrders: dailyorders.length,
    totalRevenue: totalOrderBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {

      res.status(500).send("An error occurred while generating the Excel file");
    });
};

const monthlyDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook
  const worksheet = workbook.addWorksheet('Sales Data');
  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  monthlyOrders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      orderDate: order.date,
      discount: order.discount,
      totalBill: order.total,
    })
  })
  worksheet.addRow({
    totalOrders: monthlyOrders.length,
    totalRevenue: totalMonthlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );
  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      res.status(500).send("An error occurred while generating the Excel file");
    });
};
const daily=async(req,res)=>{
  try{
    const orderDate = req.body.daily;  
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    dailyorders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    res.render('dashboard',{dailyorders})
  }
  catch(err){
    console.log(err)
  }
}
const monthlysales=async(req,res)=>{
  try{
    const monthinput = req.body.month;
    const year = parseInt(monthinput.substring(0, 4));
    const month = parseInt(monthinput.substring(5));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    monthlyOrders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: 'Delivered' // Filter by status
    })
      .sort({ date: 'desc' });
    totalMonthlyBill = monthlyOrders.reduce(
      (totall, order) => totall + Number(order.total),
      0
    );
    res.render("monthlyOrders", { monthlyOrders, totalMonthlyBill });
  }
  catch(err){
    console.log(err)
  }
}

const dailycancel=async(req,res)=>{
  try{
    const orderDate = req.body.daily;
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");

    dailyorders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate
      },status: 'Cancelled'
    })
    // console.log(dailyorders, "DailyOrdersssss");
    totalOrderBill = dailyorders.reduce(
      (total, order) => total + Number(order.total),
      0
    );
    // console.log(totalOrderBill, "totalOrderBill");
    res.render('dailyCancel', { dailyorders, totalOrderBill });
  }
  catch(err){

    console.log(err)
  }
}
const monthlycancel=async(req,res)=>{
  try{
    const monthinput = req.body.month;
    const year = parseInt(monthinput.substring(0, 4));
    const month = parseInt(monthinput.substring(5));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    monthlyOrders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: 'Cancelled' // Filter by status
    })
      .sort({ date: 'desc' });
    totalMonthlyBill = monthlyOrders.reduce(
      (totall, order) => totall + Number(order.total),
      0
    );
    res.render("monthlyCancel", { monthlyOrders, totalMonthlyBill });
  }
  catch(err){
    console.log(err)
  }
}
const dailycancelDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Delivery Name", key: "deliveryName", width: 20 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  dailyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      deliveryName: order.address.name,
      orderDate: order.date,
      discount: order.discount,
      totalBill: order.total,
    });
  });
  worksheet.addRow({
    totalOrders: dailyorders.length,
    totalRevenue: totalOrderBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {

      res.status(500).send("An error occurred while generating the Excel file");
    });
};

const monthlycancelDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook
  const worksheet = workbook.addWorksheet('Sales Data');
  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  monthlyOrders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      orderDate: order.date,
      discount: order.discount,
      totalBill: order.total,
    })
  })
  worksheet.addRow({
    totalOrders: monthlyOrders.length,
    totalRevenue: totalMonthlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );
  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      res.status(500).send("An error occurred while generating the Excel file");
    });
};

const dailyStock = async (req, res) => {
  try {
    const stockDate = req.body.daily;
    
    

  const stock=await Product.find();
  console.log("stock",{stock})
   
    res.render('dailyStock', { stock});
  } catch (error) {
    console.log(error.message);
  }
};

const dailystockDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stock Data");
  worksheet.columns = [
    
    { header: "product Name", key: "productname", width: 20 },
   
    { header: "quantity", key: "quantity", width: 10 },
   
    
  ];

  dailyorders.forEach((product) => {
    worksheet.addRow({
      
    productname: product.name,
     
      quantity: product.quantity,
      
    });
  });
  
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "Stockdata.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {

      res.status(500).send("An error occurred while generating the Excel file");
    });
};
  module.exports={
    loginLoad,
    loginVerify,
    blockUser,
    unblockUser,
    dashBoard,
    userList,
    unlistProduct,
    listProduct,
    getOrder,
    orderdetails,
    changeOrderStatus,
    unlistCategory,
    listCategory,
    logout,
    searchProducts,
    catSearch,
    addbanner,
    loadAddbanner,
    banner,
    deleteBanner,
    dailySales,
    daily,
    dailyDownload,
    monthlysales,
    monthlyDownload,
    dailycancel,
    monthlycancel,
     dailycancelDownload ,
    monthlycancelDownload,
    dailyStock,
    dayData,
    dailystockDownload
  }