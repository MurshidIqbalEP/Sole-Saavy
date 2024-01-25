const mongoose = require('mongoose');

const wallet=mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
   balance:{
    type:Number,
    require:true,
    default:0
   },
   history:[
    {
        type: {
            type: String,

        },
        amount: {
            type: Number,

        },
        reason: {
            type: String,

        },
        date: {
            type: Date,
            default: Date.now()
        }
    }
   ]
    

})

module.exports=mongoose.model("Wallet",wallet) 