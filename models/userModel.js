const mongoose=require('mongoose') 

// Define the User Schema
const userSchema  =new mongoose.Schema({
    name:{
        type:String 
    },
    email:{
        type:String
       },
    mobile:{
        type:String
        },
    password:{
        type:String   
    },
    cpassword:{
        type:String
    },
    is_admin:{
        type:Number,
        default:0
        
    },
    is_varified:{
       type:Number,
       
    },
    is_blocked: {
        type: Boolean,
        required: false
    },
    
    wishlist: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    cart:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity:{
                type: Number, 
                default: 1
            }      
        }
    ],
    wallet:{
        type: Number,
        default: 0
    },
    address:[
       {
        userId: {type: String, required: true},
        name: {type: String,required: true},
        mobile: {type: String,required: true},
        adressLine1: {type: String,required: true},
        adressLine2: { type: String,},
        city: {type: String,required: true},
        state: { type: String,required: true},
        pin: {type: String,required: true},
        is_default: {type: Boolean,required: true}
       }
    ]
   
})
// Create the User Model

module.exports=mongoose.model('User',userSchema);