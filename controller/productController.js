const Product=require("../models/productModel")
const category=require("../models/categoryModel")
const User=require("../models/userModel")
const fs=require('fs');
const { builtinModules } = require("module");
const sharp = require('sharp');


const getaddProduct = async (req, res) => {
    try {
        const categories= await category.find();
        console.log(categories)
        res.render('addProduct', { categories });
    } catch (error) {
        console.log(error.message);
    }
}

// const addProduct=async(req,res)=>{
//     try{
//         const productdescription = req.body.description;
//         const images = [];
//         const files = req.files;
//         console.log("file",files)
//         if (!files) {
//             return res.status(400).json({ message: 'No file uploaded' });
//           }
         
//           for (const file of files) {
//             const imageBuffer = await sharp(file.path)
//               .extract({ left:100, top:200, width:100, height:200})
//               .toBuffer();
//               const image = `cropped_${file.filename}`;

//               console.log("cropped image",image)
//               fs.writeFileSync(image, imageBuffer);

//                 images.push(image);
//           }
//           const categorydata = await category.find();
//           const productdata = await Product.findOne({ description: productdescription });

//           if (productdata) {
//                             res.render('addproduct', { message1: "Product already exists" });
//                          } else {
//                              const product = new Product({
//                                  name: req.body.name,
//                                  description: req.body.description,
//                                  image: images,
//                                  brand: req.body.brand,
//                                  price: req.body.price,
//                                  category: req.body.category,
//                                 quantity:req.body.quantity,
//                                  // offer: req.body.offer,
//                                  // offerprice: offerprice, // Use the calculated offerprice variable here
//                                  is_blocked: false,
//                              });
                             
//                              const productdata = await product.save();
//                              res.render('addproduct', { message: 'Product added successfully', product: productdata ,categorydata ,images});
//                          }
//     }

//     catch(err){
//         console.log(err)
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
const addProduct = async (req, res) => {
    try {

        const productdescription = req.body.description;
        // const arrayimg = productdescription.image;
      
        console.log(req.body.description);
        const images = [];
        const file = req.files;
        console.log("file",file)
        file.forEach(element => {
            const image = element.filename;
            images.push(image);
        });
        const categorydata = await category.find();
        const productdata = await Product.findOne({ description: productdescription });
        // const offe rprice = (req.body.price) - (req.body.price) * (req.body.offer) / 100;

        const errors = {};
        if (Object.values(req.body).some(value => !value.trim() || value.trim().length === 0)) {
            errors.name = 'Please provide a product name.';
            errors.description = 'Please provide a product description.';
            errors.images = 'Please provide image'
            errors.category = 'please choose one category'
            errors.brand = 'Please provide a brand name'
            errors.price = 'please provide price'
            errors.quantity = 'Please provide Quantity'
            res.render('addProduct', { message: "", errors, categorydata })
        } else {

            if (productdata) {
                res.render('addProduct', { message1: "Product already exists" });
            } else {
                const product = new Product({
                    name: req.body.name,
                    description: req.body.description,
                    image: images,
                    brand: req.body.brand,
                    price: req.body.price,
                    category: req.body.category,
                    quantity:req.body.quantity,
                    // offer: req.body.offer,
                    // offerprice: offerprice, // Use the calculated offerprice variable here
                    is_blocked: false,
                });
               
                const productdata = await product.save();
                res.redirect('productpage');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadProduct = async (req, res) => {
    try {
         const product=await Product.find();
         const categories=await category.find()
         res.render('products',{product,categories})
       
} 
catch(err){
    console.log(err)
}    
        
}
const getEditproduct=async(req,res)=>{
    try{
        const id = req.params.id;

        const productdata = await Product.findById(id).populate('category')
        const categorydata = await category.find()
        const images = productdata.image
                const imagefile = images.map((item) => {
            return item
        });
          
        res.render('editProduct', { Product: productdata, images: imagefile, categorydata })
      
    }
    catch(err){
        console.log(err.message)
    }
}
const productUpdate=async(req,res)=>{
    try {
        

        const id = req.params.id;
          console.log(id)
        const productdata = await Product.findById(id);
        const exImage = productdata.image;
        console.log(req.file)
        const files = req.files;
        console.log("files",files)
        let updImages = [];
        if (files && files.length > 0) {
            const newImages = req.files.map((file) => file.filename);
            updImages = [...exImage, ...newImages]
            productdata.image = updImages;
        } else {
            updImages = exImage;
        }
        console.log("uplaoded image",updImages)
        const { name, price, description, category, quantity, brand } = req.body
        //console.log(productdata, "Product is getting............")
        await Product.findByIdAndUpdate(id, {
            $set: {
                name: name,
                description: description,
                image: updImages,
                category: category,
                price: price,
                brand: brand,
                quantity: quantity,
                is_blocked: false
            }
        }, { new: true });
        res.redirect('/admin/productpage')

    } catch (error) {
        console.log(error.message);
    }
}
const productImage=async(req,res)=>{
    try{
        const productId = req.params.id;
        console.log("proId",productId)
      
        const imageIndex = req.params.imageIndex;
        // Fetch the product from the database
      const product = await Product.findById(productId);
      if (!product || !product.image || product.image.length <= imageIndex) {
        return res.status(404).send('Image not found');
      }
      const image = product.image[imageIndex];
      // Get the requested cropping dimensions (you can adjust these as needed)
      const width = parseInt(req.query.width) || 100; // Default width
      const height = parseInt(req.query.height) || 100; // Default height
  
      // Use sharp to resize and crop the image
      const croppedImageBuffer = await sharp(image.data)
        .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
        .toBuffer();
         // Set the appropriate Content-Type header and send the cropped image
      res.set('Content-Type', image.contentType);
      res.send(croppedImageBuffer);

    }
    catch(err){
        console.log(err)
    }
}
const productImageuser=async(req,res)=>{

  try{
    const productId = req.params.product_id;
    console.log(productId)
    const imageIndex = req.params.imageIndex;
    // Fetch the product from the database
  const product = await Product.findById(productId);
  if (!product || !product.image || product.image.length <= imageIndex) {
    return res.status(404).send('Image not found');
  }
  const image = product.image[0];
  const width = parseInt(req.query.width) || 300; // Default width
      const height = parseInt(req.query.height) || 300; // Default height
      const croppedImageBuffer = await sharp(image.data)
      .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
      .toBuffer();
       // Set the appropriate Content-Type header and send the cropped image
    res.set('Content-Type', image.contentType);
    res.send(croppedImageBuffer);
  }
catch(err){
    console.log(err)
}
}
module.exports={
    getaddProduct,
    addProduct,
    loadProduct,
    getEditproduct,
    productUpdate,
    productImage,
    productImageuser
}