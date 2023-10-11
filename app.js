const express=require('express')
const app=express();
const path=require('path');
const fs=require("fs")
const hbs = require("hbs");
const mongoose=require("mongoose");
const nocache = require("nocache");
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
// const Swal = require('sweetalert2')
// window.Swal = swal;

app.use(express.static(__dirname + '/public'));
app.use(nocache());
const userRouter=require("./routers/userRouter");
app.use('/',userRouter);

const adminRouter=require("./routers/adminRouter");
app.use('/admin',adminRouter);





hbs.registerPartial('userfooter', fs.readFileSync(__dirname + '/views/partials/userFooter.hbs', 'utf8'));
hbs.registerPartial('userheader', fs.readFileSync(__dirname + '/views/partials/uesrHeader.hbs', 'utf8'))
hbs.registerPartial('adminheader', fs.readFileSync(__dirname + '/views/partials/adminHeader.hbs', 'utf8'))
hbs.registerPartial('adminfooter', fs.readFileSync(__dirname + '/views/partials/adminFooter.hbs', 'utf8'))

hbs.registerHelper({
  isActive: function (currentSection, targetSection) {
    return currentSection === targetSection ? 'active' : '';
  },
});









const PORT = process.env.PORT || 3001;
app.listen(PORT, function () {
  console.log("Server Runnig in http://localhost:3001");
  });