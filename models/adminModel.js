const mongoose = require('mongoose');

const admin=mongoose.Schema({
    FirstName:{
        type:String,
        require:true
    },
    LastName:{
        type:String,
        require:true
    },
    Email:{
        type:String,
        require:true
    },
    Password:{
        type:String,
        require:true
    },
    is_admin:{
        type:Number,
        default:1
    },
    token:{
        type:String,
        default:''
    },

})

module.exports=mongoose.model("Admins",admin) 