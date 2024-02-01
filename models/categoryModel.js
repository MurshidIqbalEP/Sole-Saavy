const mongoose = require('mongoose');

const category=mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    is_listed:{
        type:Boolean,
        default:true
    },
    offerName:{
        type:String,
        default:''
    },
    offerPercentage:{
        type:Number,
        default:0
    }
    

})

module.exports=mongoose.model("Categories",category) 