const mongoose = require('mongoose');

const product=mongoose.Schema({
    productName:{
        type:String,
        require:true
    },
    actualPrice:{
        type:Number,
        require:true
    },
    image:[{
        type:String,
        require:true
    }],
   description:{
        type:String,
        require:true
    },
    Stock:{
        type:Number,
        require:true
    },
    is_listed:{
        type:Boolean,
        default:true
    },
    category:{
        type:String,
        require:true
    },
    offerAmound:{
        type:Number,
        default:0
    },
    offerName:{
        type:String,
        default:''
    }
    

})

module.exports=mongoose.model("products",product) 