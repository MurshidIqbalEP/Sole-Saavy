const User = require("../models/UserModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sendMail = require("../mail");
const resetpassmail = require("../resetpass");
const randomstring = require("randomstring");
const category = require("../models/categoryModel");
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

// password hashing
const securepassword = async (Password) => {
  try {
    const passwordhash = await bcrypt.hash(Password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

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

// Generate a random 5-digit OTP
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// referal code generater
function generateRefCode(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, length); // return the required number of characters
}

// rendering register
const loadRegister = async (req, res) => {
  try {
    if (req.query.refCode) {
      req.session.refCode = req.query.refCode;
    }

    res.status(200).render("userView/register");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//rendering login
const loadLogin = async (req, res) => {
  try {
    res.status(200).render("userView/login");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// user logout
const userLogOut = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

// rendering home page
const loadhome = async (req, res) => {
  try {
    res.status(200).render("userView/home");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// creating user
const insertUser = async (req, res) => {
  try {
    const spass = await securepassword(req.body.pass);

    const mailchecking = await User.findOne({ Email: req.body.email });
    const referelCode = generateRefCode(10);
    console.log(referelCode);
    if (mailchecking) {
      res
        .status(200)
        .render("userView/register", { message: "Mail is Alreadyb Exist" });
    } else {
      const user = new User({
        FirstName: req.body.Firstname,
        LastName: req.body.Lastname,
        Email: req.body.email,
        Password: spass,
        refCode: referelCode,
      });
      const userdata = await user.save();

      req.session.user = userdata;
      const otp = generateOTP();
      req.session.otp = otp;
      console.log(req.session.user._id);

      sendMail(req.session.user.Email, req.session.user.FirstName, otp);

      res.status(200).redirect("/otp-verification");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// resent otp
const resendotp = async (req, res) => {
  const otp = generateOTP();
  req.session.otp = otp;

  sendMail(req.session.user.Email, req.session.user.FirstName, otp);
  res.status(200).render("userView/otp", { resendOtpMsg: "resending otp" }); /////////////////
};

// rendering otp page
const loadotp = async (req, res) => {
  try {
    res.status(200).render("userView/otp");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// verifing otp page and creating wallet
const verifyotp = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5 } = req.body;
    const userOtp = parseInt(otp1 + otp2 + otp3 + otp4 + otp5);

    // console.log(req.session.otp);
    // console.log(userOtp);

    if (userOtp == req.session.otp) {
      const updateInfo = await User.updateOne(
        { _id: req.session.user._id },
        { $set: { is_verified: 1 } }
      );
      // mongo db updating ////////////////////////
      // console.log(updateInfo);
      if (updateInfo) {
        console.log(req.session);

        if (req.session.refCode) {
          const ReferedPerson = await User.findOne({
            refCode: req.session.refCode,
          });
          const ReferedPersonsWallet = await Wallet.findOne({
            userId: ReferedPerson._id,
          });
          ReferedPersonsWallet.balance += 3000;
          ReferedPersonsWallet.history.push({
            type: "Credit",
            amount: 3000,
            reason: "Referal",
          });
          await ReferedPersonsWallet.save();
          console.log(ReferedPersonsWallet);

          const newWallet = await new Wallet({
            userId: req.session.user._id,
            balance: 1000,
            history: [
              {
                type: "Credit",
                amount: 1000,
                reason: "Referal",
              },
            ],
          });
          const WalletCreated = await newWallet.save();
        }

        res.status(200).redirect("/login");
      }
    } else {
      res.status(200).render("userView/otp", { message: "invalid otp" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// verifying login
const verifylogin = async (req, res) => {
  try {
    const Email = req.body.Email;
    const password = req.body.pass;

    const userData = await User.findOne({ Email: Email });
    req.session.userId = userData._id;

    // Checking registration
    if (!userData) {
      return res
        .status(200)
        .render("userView/login", { message: "Invalid user" });
    }

    // Password matching
    const passmatch = await bcrypt.compare(password, userData.Password);
    if (!passmatch) {
      return res
        .status(200)
        .render("userView/login", { message: "Invalid password" });
    }

    // Check if the user is blocked
    if (userData.is_blocked) {
      return res
        .status(200)
        .render("userView/login", { message: "User is Blocked" });
    }

    // Checking if the user is verified
    if (!userData.is_verified) {
      const loginotp = generateOTP();
      req.session.otp = loginotp;
      sendMail(req.body.Email, userData.FirstName, loginotp);

      return res.status(200).render("userView/login", {
        verifymessage: "Verify your account",
      });
    }

    // If everything is okay, redirect to the home page
    res.status(200).redirect("home");
  } catch (error) {
    // Handle the error appropriately, maybe by rendering an error page
    res
      .status(404)
      .render("404.ejs", { errorMessage: "Internal Server Error" });
  }
};

// endering forgot password page
const loadforgetpass = async (req, res) => {
  try {
    res.status(200).render("userView/forgetpass");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// new password sending
const sendforgrtpass = async (req, res) => {
  try {
    const Email = req.body.Email;
    const userData = await User.findOne({ Email: Email });

    if (userData) {
      if (userData.is_verified === 0) {
        res
          .status(200)
          .render("userView/forgetpass", { message: "varify your accound" });
      } else {
        const randomword = randomstring.generate();
        const tokenUpdate = await User.updateOne(
          { Email: Email },
          { $set: { token: randomword } }
        );
        resetpassmail(userData.Email, userData.FirstName, randomword);
        res.status(200).render("userView/forgetpass", {
          message: " please check your email",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// reset passwor page
const loadforgetpassword = async (req, res) => {
  try {
    const tkn = req.query.token;
    const tokenData = await User.findOne({ token: tkn });

    if (tokenData) {
      res
        .status(200)
        .render("userView/Resetpassword", { user_id: tokenData._id });
    } else {
      res.status(200).render("userView/404", { message: "invalid token" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// reset page rendering
const Resetpassword = async (req, res) => {
  try {
    const newpassword = req.body.Password;
    const user_id = req.body.user_id;
    const securedpass = await securepassword(newpassword);

    const resetpassAndtoken = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { Password: securedpass, token: "" } }
    );

    res.status(200).redirect("home");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// rending shop
const loadShop = async (req, res) => {
  try {
    let search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;
    const limit = 6;
    let cat = req.query.cat || "";
    let sortDirection = parseInt(req.query.srt) || 1;

    const categories = await category.find({ is_listed: true });

    // Build the query object for filtering
    const query = {
      is_listed: true,
      productName: { $regex: ".*" + search + ".*", $options: "i" },
    };

    if (cat) {
      query.category = { $regex: ".*" + cat + ".*", $options: "i" };
    }

    const products = await product
      .find(query)
      .sort({ actualPrice: sortDirection })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await product.countDocuments(query);

    res.status(200).render("userView/shop", {
      categories,
      products,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      currentCategory: cat,
      currentSort: sortDirection,
      search,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
// rendering product details page
const loadShopDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const products = await product.findOne({ _id: id });

    if (products) {
      res.status(200).render("userView/productdetails", { product: products });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
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
      const productCheck = await cart.findOne({ "items.productId": productid });
      if (productCheck) {
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
    const findingUsersCart = await cart
      .findOne({ userId: req.session.userId })
      .populate("items.productId");

    res.status(200).render("userView/cart", { cart: findingUsersCart });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

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

// rendering profile
const loadprofile = async (req, res) => {
  try {
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    let limit = 3;

    const userId = req.session.userId;
    const findUser = await User.findOne({ _id: userId });
    if (findUser) {
      const address = await Address.find({ userid: req.session.userId });
      const orders = await Orders.find({ userid: req.session.userId })
        .populate("products.productId")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ orderedDate: -1 }) // Sorting by the "createdAt" field in descending order
        .exec();

      const count = await Orders.find({
        userid: req.session.userId,
      }).countDocuments();

      const totalPage = Math.ceil(count / limit);

      res.status(200).render("userView/profile.ejs", {
        user: findUser,
        Address: address,
        Orders: orders,
        totalPage,
        currentPage: page,
      });
    } else {
      res.status(200).render("userView/404.ejs");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit password
const editPassword = async (req, res) => {
  try {
    const currentPass = req.body.currentPass;
    const newPass = req.body.newPass;
    const userid = req.session.userId;

    const user = await User.findOne({ _id: userid });
    if (user) {
      bcrypt.compare(currentPass, user.Password, async (err, result) => {
        if (result === true) {
          newHashedpass = await bcrypt.hash(newPass, 10);
          user.Password = newHashedpass;
          await user.save();
          res.status(200).json({ value: 1 });
        } else {
          res.status(200).json({ value: 0 });
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// add new address
const addAddress = async (req, res) => {
  try {
    const address = new Address({
      userid: req.session.userId,
      fullname: req.body.Fullname,
      city: req.body.City,
      state: req.body.State,
      pincode: req.body.Pin,
      phone: req.body.Phone,
    });

    const added = await address.save();

    if (added) {
      res.status(200).json({ value: 1 });
    } else {
      res.status(200).json({ value: 0 });
    }
  } catch (error) {}
};

// edit address
const loadEditAddress = async (req, res) => {
  try {
    const ProductId = req.query.id;

    const address = await Address.findOne({ _id: ProductId });
    res
      .status(200)
      .render("userView/editAddress.ejs", { Address: address, message: null });
  } catch (error) {
    console.log(error.message);
  }
};

// edit address
const EditAddress = async (req, res) => {
  try {
    const Fullname = req.body.fullname;
    const City = req.body.city;
    const State = req.body.state;
    const Pin = req.body.Pin;
    const Phone = req.body.phone;
    const id = req.body.id;

    const edited = await Address.findByIdAndUpdate(id, {
      $set: {
        fullname: Fullname,
        city: City,
        state: State,
        pincode: Pin,
        phone: Phone,
      },
    });

    if (edited) {
      res.status(200).render("userView/editAddress", {
        message: "Address Edited",
        Address: edited,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete address
const deleteAddress = async (req, res) => {
  try {
    const id = req.body.ProductId;
    const Userid = req.session.userId;
    const deleting = await Address.findByIdAndDelete({ _id: id });
    if (deleting) {
      res.status(200).json({ value: 1 });
    } else {
      res.status(200).json({ value: 0 });
    }
  } catch (error) {
    console.log(error.message);
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
    console.log("adya fetch");
    const { addressId, Total, discount } = req.body;
    const amount = parseInt(Total);
    const userId = req.session.userId;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: userId,
    };

    console.log("hai");
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

//rendering order succes page
const loadOrderSuccess = async (req, res) => {
  try {
    res.status(200).render("userView/orderSuccess");
  } catch (error) {
    console.log("error.message");
  }
};

// rendering wallet
const loadWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.session.userId });

    if (wallet) {
      // Sort the history array in descending order based on date
      wallet.history.sort((a, b) => b.date - a.date);
      res.status(200).render("userView/wallet", { wallet });
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
  insertUser,
  loadRegister,
  loadhome,
  loadLogin,
  userLogOut,
  loadotp,
  verifyotp,
  resendotp,
  verifylogin,
  loadforgetpass,
  sendforgrtpass,
  loadforgetpassword,
  Resetpassword,
  loadShop,
  loadShopDetail,
  addtocart,
  loadCart,
  updateQuantity,
  removeProduct,
  loadcheckout,
  loadprofile,
  editPassword,
  addAddress,
  loadEditAddress,
  EditAddress,
  deleteAddress,
  placeOrder,
  walletOrder,
  loadOrderDetails,
  cancellOrder,
  returnOrder,
  invoiceData,
  onlinePayment,
  verifyPayment,
  loadOrderSuccess,
  loadWallet,
  applyCoupon,
};
