const mongoose=require("mongoose");

const user=mongoose.Schema({
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
        default:0
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_blocked:{
      type:Boolean,
      default:false
    },
    token:{
        type:String,
        default:''
    },

})

module.exports=mongoose.model("Users",user)  // collection name and schema name