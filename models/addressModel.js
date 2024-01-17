const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const address = mongoose.Schema({
   userid:{
    type:ObjectId,
    ref:'users',
    require:true
   },
    fullname:{
        type:String,
        require:true
    },
    city:{
        type:String,
        require:true
     },
     state:{
        type:String,
        require:true
     },
     pincode:{
        type:Number,
        require:true
     },
     phone:{
        type:Number,
        require:true
     }

})
module.exports=mongoose.model('Address',address)