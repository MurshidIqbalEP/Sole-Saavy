const mongoose = require('mongoose');

const refferel=mongoose.Schema({
   
   history:[
    {
        Referrer: {
            type: String,

        },
        referrerEmail: {
            type: String,

        },
        Recipient: {
            type: String,

        },
        RecipientEmail: {
            type:String,
           
        },
        date:{
            type:Date,
            default:Date.now
        }

    }
   ]
    

})

module.exports=mongoose.model("refferel",refferel) 