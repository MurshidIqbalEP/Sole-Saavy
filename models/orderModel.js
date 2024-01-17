const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const order = mongoose.Schema({
  userid: {
    type: String,
    ref: "User",
    require: true,
  },
  shippingAddress: {
    fullname: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
      require: true,
    },
    pincode: {
      type: Number,
      require: true,
    },
    phone: {
      type: Number,
      require: true,
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        require: true,
      },
      quantity: {
        type: Number,
        require: true,
      },
      orderStatus:{
        type:String,
        default:'order Placed'
      },
      returnOrderStatus:{
        status:{
          type:String
        },
        reason:{
          type:String
        },
        date:{
          type:Date
        }
      }
    }
  ],
  orderStatus: {
    type: String,
    default: "Order Placed",
  },
  orderedDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    require: true,
  },
  paymentMethod:{
    type:String,
    default:'COD',
  }
});

module.exports = mongoose.model("Orders", order);
