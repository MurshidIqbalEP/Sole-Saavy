const mongoose = require('mongoose');

const cart = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports=mongoose.model("Cart",cart) 
  
