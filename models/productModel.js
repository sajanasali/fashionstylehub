const mongoose=require('mongoose')
const productSchema=new mongoose.Schema({
       name:{
        type:String
       },
       description:{
            type:String
       },
       
      image:{
        type: Array,
        required:true,
           },
    
      quantity: {
            type: Number
            
        },
       
       brand:{
        type:String
       },
       price:{
          type:Number
       },
       category:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"Category"
       },
       is_blocked: {
        type: Boolean,
        default: false
    },
   
    isWishlisted:{
        type:Boolean,
        dafault:true
    },
    isOnCart: {
        type: Boolean,
        default: false,
    },
    unlist:{
        type:Boolean,
        default:false
    }

       



})


module.exports=mongoose.model('Product',productSchema);