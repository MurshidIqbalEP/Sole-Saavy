const mongoose = require('mongoose');

const category=mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    is_listed:{
        type:Boolean,
        default:true
    }
    

})

module.exports=mongoose.model("Categories",category) 