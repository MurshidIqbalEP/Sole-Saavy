const User = require("../models/UserModel");
const mongoose = require("mongoose");
const cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const coupon = require("../models/couponModel");
const crypto = require("crypto");
const session = require("express-session");
require("dotenv").config();


// add to cart products
const addtocart = async (req, res) => {
    try {
      const productid = req.body.prodId;
      const Quantity = 1;
      const userid = req.session.userId;
  
      const userincart = await cart.findOne({ userId: userid });
  
      if (!userincart) {
        const newCart = new cart({
          userId: userid,
          items: [{ productId: productid, quantity: Quantity }],
        });
  
        const addedToCart = await newCart.save();
  
        if (addedToCart) {
          res.status(200).json({ message: "Product Added to Cart" });
        }
      } else {
        // If the cart exists, check if the product is already in the cart
        const isProductInCart = userincart.items.find(product => product.productId.toString() === productid);
        if (isProductInCart) {
          console.log(isProductInCart);
          res.status(200).json({ message: "Product Already  Exist in Cart" });
        } else {
          const newprodectinCart = {
            productId: productid,
            quantity: Quantity,
          };
  
          userincart.items.push({
            productId: productid,
            quantity: Quantity,
          });
  
          const insertNewProduct = await userincart.save();
          if (insertNewProduct) {
            res.status(200).json({ message: "Product Added to Cart" });
          } else {
            console.log("errpr");
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // rendering cart
const loadCart = async (req, res) => {
    try {
      const userid = req.session.userId;
      const newCart = new cart({
        userId: userid,  
      });
      const addedToCart = await newCart.save();
      
      const findingUsersCart = await cart
        .findOne({ userId: req.session.userId })
        .populate("items.productId");
    
      console.log(findingUsersCart);

      res.status(200).render("userView/cart", { cart: findingUsersCart });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  // updating quantity
const updateQuantity = async (req, res) => {
    try {
      const productid = req.body.productId;
      const quantity = req.body.newQuantity;
      const userid = req.session.userId;
  
      const updateQty = await cart.findOneAndUpdate(
        { userId: userid, "items.productId": productid },
        { $set: { "items.$.quantity": quantity } }
      );
  
      if (updateQty) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // removing products from cart
const removeProduct = async (req, res) => {
    try {
      const userId = req.session.userId;
      const productId = req.body.productid;
      const updatedCart = await cart.findOneAndUpdate(
        {
          userId: userId,
          "items.productId": productId,
        },
        {
          $pull: {
            items: { productId: productId },
          },
        },
        { new: true }
      );
  
      if (updatedCart) {
        res.status(200).json({ message: "updated succesgully", value: 1 });
      } else {
        res.status(200).json({ message: "updated succesgully", value: 2 });
      }
    } catch (error) {}
  };

  
// rendering checkout page
const loadcheckout = async (req, res) => {
    try {
      const Userid = req.session.userId;
      const userCart = await cart
        .findOne({ userId: Userid })
        .populate("items.productId");
      const address = await Address.find({ userid: Userid });
      const coupons = await coupon.find();
  
      var subtotal = 0;
  
      userCart.items.forEach((item) => {
        subtotal +=
          (item.productId.actualPrice - item.productId.offerAmound) *
          item.quantity;
      });
  
      if (userCart && Address) {
        res.status(200).render("userView/checkout.ejs", {
          userCart,
          Address: address,
          subtotal,
          coupons,
        });
      } else {
        res.status(400).render("userView/404.ejs");
      }
    } catch (error) {
      res.status(404).render("userView/404.ejs");
    }
  };

module.exports = {
    addtocart,
    loadCart,
    updateQuantity,
    removeProduct,
    loadcheckout

  };
  