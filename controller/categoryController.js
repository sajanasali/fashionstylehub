const Category=require('../models/categoryModel')
const bcrypt = require("bcrypt");

const categoryLoad=async(req,res)=>{

try{
const categoryList=await Category.find();
if(categoryList){
    res.send(categoryList);
}else{
    res.status(500).json({success:false})
}
}
catch(err){
    console.log(err.message)
}

}
const getAddcategory=async(req,res)=>{
    try{
        const categoryData = await Category.find();
        console.log(categoryData);
        res.render('addCategory', { categoryData });
    }
    catch(err){
        console.log(err.message)
    }
}

const insertCategory = async (req, res) => {
    try {
        if (Object.values(req.body).some(value => !value.trim() || value.trim().length === 0)) {
            res.render('addCategory', { message: 'please fill the field' })

        } else {
            // const firstlettercap = (str) => {
            //     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
            // }

            const name = req.body.name
            const nameLo = name.toLowerCase()

            const categorydata = await Category.findOne({ name: nameLo })
            if (categorydata) {
                res.render('addCategory', { message1: 'Category already exist' })
            } else {
                if (name.trim() == '') {
                    res.render('adcCategory', { message1: 'Please Enter a valid Name' })
                } else {
                    const category = new Category({
                        name:req.body.name,
                    description:req.body.description
                    })
                    const categorydata = await category.save()
                    res.render('addCategory', { message: 'Category added successfully', categorydata: categorydata })
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};
const loadcategory=async(req,res)=>{
    try{
        const categorydata=await Category.find()
            res.render('category',{categorydata})
    }
    catch(err){
        console.log(err.message)
    }
}
const loadEditcategory=async(req,res)=>{
    try {
        
        const category = await Category.findOne({ _id: req.params.id });
  res.render("editCategory", {
    
    id: req.params.id,
    category: category,
  });

    }
    catch(err){
        console.log(err.message)
    }
}

const updatecategory = async (req, res) => {
    try {
        const id = req.params.id;
        
       const name=req.body.name
       const description=req.body.description
       const category=await Category.findByIdAndUpdate({_id:id},{$set:{name:name,description:description}},{ new: true });
      
    
      res.redirect("/admin/category");
    } catch(error){
        console.log(error.message)
    }
}
const deleteCategory=async(req,res)=>{
    try {
        const _id = req.params.id
        console.log(_id);
        await Category.findByIdAndDelete(_id)
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    categoryLoad,
    getAddcategory,
    insertCategory,
    loadcategory,
 updatecategory,
    loadEditcategory,
    deleteCategory
    
    //editCategory
}