const mongoose = require('mongoose');

const coupon = new mongoose.Schema({
    couponName:{
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
        max:1000

    },
    minimumCartValue: {
        type: Number,
        required: true
    }
});

module.exports=mongoose.model("coupon",coupon);