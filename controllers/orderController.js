const User = require("../models/UserModel");
const mongoose = require("mongoose");
const product = require("../models/productModel");
const cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Orders = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const coupon = require("../models/couponModel");
const crypto = require("crypto");
const session = require("express-session");
require("dotenv").config();



// razorpay settings
const RAZORPAY = require("razorpay");

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const instance = new RAZORPAY({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

//stockManage
const StockAdjusting = async (cartData) => {
    for (let element of cartData) {
      try {
        let productId = element.productId;
        // Update the stock for the specific product
        let updateProduct = await product.updateOne(
          { _id: productId },
          { $inc: { Stock: -element.quantity } }
        );
  
        console.log(`Stock adjusted for product ${productId}`);
      } catch (error) {
        console.log(` adjusting stock: ${error}`);
      }
    }
  };

// placing an order
const placeOrder = async (req, res) => {
    try {
      const addressId = req.body.addressId;
      const Discount = req.body.discount;
      const totalAmount = req.body.Total;
      const total = parseInt(totalAmount);
      const Userid = req.session.userId;
  
      const shippingADR = await Address.findOne({ _id: addressId });
      const allProducts = await cart.findOne({ userId: Userid });
  
      const placedOrder = new Orders({
        userid: Userid,
        shippingAddress: {
          fullname: shippingADR.fullname,
          city: shippingADR.city,
          state: shippingADR.state,
          pincode: shippingADR.pincode,
          phone: shippingADR.phone,
        },
        products: allProducts.items,
        totalAmount: total,
        couponOffer: Discount,
      });
  
      const orderDone = await placedOrder.save();
      if (orderDone) {
        const dltcart = await cart.findOneAndUpdate(
          { userId: Userid },
          { $set: { items: [] } }
        );
        await StockAdjusting(allProducts.items);
        res.status(200).json({ value: 1 });
      } else {
        res.status(200).json({ value: 0 });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // order using wallet
const walletOrder = async (req, res) => {
    try {
      const addressId = req.body.addressId;
      const Discount = req.body.discount;
      const totalAmount = req.body.Total;
      const total = parseInt(totalAmount);
      const Userid = req.session.userId;
  
      const walletAmount = await Wallet.findOne({ userId: Userid });
      if (walletAmount.balance < total) {
        res.status(200).json({ value: 10 });
      } else {
        const shippingADR = await Address.findOne({ _id: addressId });
        const allProducts = await cart.findOne({ userId: Userid });
  
        const placedOrder = new Orders({
          userid: Userid,
          shippingAddress: {
            fullname: shippingADR.fullname,
            city: shippingADR.city,
            state: shippingADR.state,
            pincode: shippingADR.pincode,
            phone: shippingADR.phone,
          },
          products: allProducts.items,
          totalAmount: total,
          paymentMethod: "wallet",
          couponOffer: Discount,
        });
  
        const orderDone = await placedOrder.save();
        if (orderDone) {
          const debitonWallet = await Wallet.findOne({ userId: Userid });
          if (debitonWallet) {
            debitonWallet.balance -= total;
            debitonWallet.history.push({
              type: "Debit",
              amount: total,
              reason: "Purchase",
            });
            await debitonWallet.save();
          }
          const dltcart = await cart.findOneAndUpdate(
            { userId: Userid },
            { $set: { items: [] } }
          );
          await StockAdjusting(allProducts.items);
          res.status(200).json({ value: 1 });
        } else {
          res.status(200).json({ value: 0 });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // order by online
const onlinePayment = async (req, res) => {
    try {
      const { addressId, Total, discount } = req.body;
      const amount = parseInt(Total);
      const userId = req.session.userId;
  
      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: userId,
      };

      // Using async/await for better readability
      const order = await instance.orders.create(options);
      console.log("hai");
  
      res.status(200).json({ order, discount });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  
// verify  onlinr payment
const verifyPayment = async (req, res) => {
    try {
      const userid = req.session.userId;
  
      const { payment, Order, addressId, Total, Discount } = req.body;
      const amount = parseInt(Total);
  
      const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
      hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");
      if (generatedSignature === payment.razorpay_signature) {
        const shippingADR = await Address.findOne({ _id: addressId });
        const allProducts = await cart.findOne({ userId: userid });
  
        const placedOrderforOnline = new Orders({
          userid: userid,
          shippingAddress: {
            fullname: shippingADR.fullname,
            city: shippingADR.city,
            state: shippingADR.state,
            pincode: shippingADR.pincode,
            phone: shippingADR.phone,
          },
          products: allProducts.items,
          totalAmount: amount,
          paymentMethod: "online",
          couponOffer: Discount,
        });
        const orderDone = await placedOrderforOnline.save();
        if (orderDone) {
          const dltcart = await cart.findOneAndUpdate(
            { userId: userid },
            { $set: { items: [] } }
          );
          await StockAdjusting(allProducts.items);
  
          res.status(200).json({ value: 1 });
        }
      } else {
        console.log("signature not matching");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //rendering order succes page
const loadOrderSuccess = async (req, res) => {
    try {
      res.status(200).render("userView/orderSuccess");
    } catch (error) {
      console.log("error.message");
    }
  };

// render order details page
const loadOrderDetails = async (req, res) => {
    try {
      const orderId = req.query.orderid;
      const order = await Orders.find({ _id: orderId }).populate(
        "products.productId"
      );
      if (order) {
        res.render("userView/orderDetail", { orders: order });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  

// cancell oreder
const cancellOrder = async (req, res) => {
    try {
      const OrderId = req.body.orderid;
      const ProductId = req.body.productid;
      const price = req.body.actualPrice;
  
      const findOrder = await Orders.findOne({ _id: OrderId });
      const coundOfProducts = findOrder.products.length;
      const couponAmount = findOrder.couponOffer;
      const coupenAmountPerProduct = Math.floor(couponAmount / coundOfProducts);
  
      const Cancelled = findOrder.products.find(
        (product) => product.productId.toString() === ProductId
      );
  
      Cancelled.orderStatus = "Cancelled";
      const Save = await findOrder.save();
  
      const quantity = Cancelled.quantity;
  
      const total = quantity * price;
  
      if (
        findOrder.paymentMethod === "online" ||
        findOrder.paymentMethod === "wallet"
      ) {
        const wallet = await Wallet.findOne({ userId: req.session.userId });
        if (wallet) {
          wallet.balance += total - coupenAmountPerProduct;
          wallet.history.push({
            type: "Credit",
            amount: total - coupenAmountPerProduct,
            reason: "order cancel refund",
          });
          await wallet.save();
        } else {
          console.log("wallet koodlla");
        }
      }
  
      if (Save) {
        res.status(200).json({ value: 1 });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
// return order
const returnOrder = async (req, res) => {
    try {
      const Reason = req.body.selectedOption;
      const orderId = req.body.orderId;
      const productId = req.body.productId;
      const quantity = req.body.quantity;
      const price = req.body.actualPrice;
      const total = quantity * price;
  
      const returnedOrder = await Orders.findOne({ _id: orderId });
  
      const coundOfProducts = returnedOrder.products.length;
  
      const couponAmount = returnedOrder.couponOffer;
  
      if (!returnedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      const returnedProduct = returnedOrder.products.find(
        (product) => product.productId.toString() === productId
      );
  
      if (!returnedProduct) {
        return res.status(404).json({ error: "Product not found in the order" });
      }
  
      returnedProduct.orderStatus = "Returned";
  
      const coupenAmountPerProduct = Math.floor(couponAmount / coundOfProducts);
  
      const returnDone = await returnedOrder.save();
  
      if (returnDone) {
        if (
          returnedOrder.paymentMethod === "online" ||
          returnedOrder.paymentMethod === "COD" ||
          returnedOrder.paymentMethod === "wallet"
        ) {
          const wlt = await Wallet.findOne({ userId: req.session.userId });
  
          if (!wlt) {
            return res.status(404).json({ error: "Wallet not found" });
          }
  
          wlt.balance += total - coupenAmountPerProduct;
  
          wlt.history.push({
            type: "Credit",
            amount: total - coupenAmountPerProduct,
            reason: "order return refund",
          });
  
          await wlt.save();
        }
  
        if (Reason !== "Damaged Product") {
          const Product = await product.findOneAndUpdate(
            { _id: productId },
            { $inc: { Stock: quantity } }
          );
  
          if (!Product) {
            return res.status(404).json({ error: "Product not found" });
          }
        }
  
        return res.status(200).json({ value: 1 });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // fetching invoice datas
const invoiceData = async (req, res) => {
    try {
      const orderId = req.body.orderid;
      const orders = await Orders.findOne({ _id: orderId }).populate(
        "products.productId"
      );
      if (orders) {
        res.status(200).json({ orders });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // apply coupon
const applyCoupon = async (req, res) => {
    try {
      const Name = req.body.coupon;
      const Amount = req.body.Amount;
  
      const Coupon = await coupon.findOne({ couponName: Name });
      if (Amount >= Coupon.minimumCartValue) {
        const DiscountAmount = Coupon.discount;
        const Discount = Amount - DiscountAmount;
        res.status(200).json({ value: 1, Discount, DiscountAmount });
      } else {
        res.status(200).json({ value: 0 });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

module.exports = {
    placeOrder,
    walletOrder,
    onlinePayment,
    verifyPayment,
    loadOrderSuccess,
    loadOrderDetails,
    cancellOrder,
    returnOrder,
    invoiceData,
    applyCoupon
}