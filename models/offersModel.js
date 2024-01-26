const mongoose = require('mongoose');

const offer =mongoose.Schema({
    offerName:{
        type:String,
        require:true
    },
    validFrom:{
        type:Date,
        default:Date.now
    },
    expiry:{
        type:Date,
        require:true
    },
    discount:{
        type:Number,
        require:true,
        min:0,
        max:100

    } 

});

module.exports=mongoose.model("Offers",offer);