const admin = require("../models/adminModel");
const user = require("../models/UserModel");
const category = require("../models/categoryModel");
const product = require("../models/productModel");
const Orders = require("../models/orderModel");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const { trusted } = require("mongoose");
const { render } = require("../routes/userRoutes");

const securepassword = async (Password) => {
  try {
    const passwordhash = await bcrypt.hash(Password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminLogin = async (req, res) => {
  try {
    res.status(200).render("adminView/login");
  } catch (error) {
    res.send(error.message);
  }
};

const LoginVerify = async (req, res) => {
  try {
    const email = req.body.Email;
    const pass = req.body.pass;

    const adminData = await admin.findOne({ Email: email });

    if (adminData) {
      const passmatch = await bcrypt.compare(pass, adminData.Password);

      if (passmatch) {
        req.session.admin_id = adminData._id;
        res.status(200).redirect("admin/Dashboard");
      } else {
        res
          .status(200)
          .render("adminView/login", { message: "invalid  password" });
      }
    } else {
      res
        .status(200)
        .render("adminView/login", { message: "invalid email or password" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

const adminLogOut = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/admin");
  } catch (error) {}
};

const loadHome = async (req, res) => {
  try {
    res.status(200).render("adminView/Dashboard");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadCustomers = async (req, res) => {
  try {
    const onlyUser = await user.find({ is_admin: 0 });
    res.status(200).render("adminView/customers", { users: onlyUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadCategory = async (req, res) => {
  try {
    const Categories = await category.find();
    res.status(200).render("adminView/category", { categories: Categories });
   
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const catNAme = req.body.category;
    const newcat = await category.findOne({
      categoryName: { $regex: new RegExp(`^${catNAme}$`, "i") },
    });

    if (newcat) {
      res.json({ message: "category already exists", value: 0 });
    } else {
      console.log("success");
      const Category = new category({
        categoryName: req.body.category,
        is_listed: true,
      });
      const categorydata = await Category.save();

      if (categorydata) {
        // res.redirect('/adminView/category')
        res.status(200).json({ message: "Category added", value: 1 });
      }
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadProducts = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    let limit = 5;

    let srt = 1;

    if (req.query.srt) {
      let request = req.query.srt;
      srt = parseInt(request, 10);
    }

    const allProduct = await product
      .find({ productName: { $regex: ".*" + search + ".*", $options: "i" } })
      .sort({ productName: srt })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await product
      .find({ productName: { $regex: ".*" + search + ".*", $options: "i" } })
      .countDocuments();
    res.status(200).render("adminView/products", {
      product: allProduct,
      totalpage: Math.ceil(count / limit),
      currentpage: page,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadBlockUser = async (req, res) => {
  try {
    const userid = req.body.userId;
    const userData = await user.findOne({ _id: userid });
    userData.is_blocked = true;
    const saved = await userData.save();
    if (saved) {
      res.status(200).json({ message: "user is blocked succefully" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadunblockUser = async (req, res) => {
  try {
    const userid = req.body.userId;
    const userData = await user.findOne({ _id: userid });
    userData.is_blocked = false;
    const saved = await userData.save();
    if (saved) {
      res.status(200).json({ message: "user is unblocked succefully" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const unlistCategory = async (req, res) => {
  try {
    const CategoryId = req.body.categoryId;
    const catagoryData = await category.findOne({ _id: CategoryId });
    catagoryData.is_listed = false;

    const UL = await catagoryData.save();

    res.status(200).json({ message: "category unlisted" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const listCategory = async (req, res) => {
  try {
    const CategoryId = req.body.categoryId;
    const catagoryData = await category.findOne({ _id: CategoryId });
    catagoryData.is_listed = true;

    const UL = await catagoryData.save();

    res.status(200).json({ message: "category listed" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadEdit = async (req, res) => {
  try {
    const id = req.query.id;
    const catData = await category.findById({ _id: id });
    if (catData) {
      res.status(200).render("adminView/editCategory", { catData, id });
    }
  } catch (error) {
    res.status(200).send(error.message);
  }
};

const Edit = async (req, res) => {
  try {
    const id = req.body.ID;
    const inputdata = req.body.inputCat;

    const validate = await category.findOne({
      categoryName: { $regex: new RegExp(`^${inputdata}$`, "i") },
    });

    if (!validate) {
      const editData = await category.findOneAndUpdate(
        { _id: id },
        { $set: { categoryName: inputdata } }
      );
      if (editData) {
        res.status(200).json({ value: 1 });
      }
    } else {
      res.status(200).json({ value: 0 });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const Product = await product.find({});
    res.status(200).render("adminView/addProduct", { Product });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const insertProduct = async (req, res) => {
  try {
    const img = [];
    for (let i = 0; i < req.files.length; i++) {
      img.push(req.files[i].filename);
    }

    const Product = new product({
      productName: req.body.productName,
      actualPrice: req.body.actualPrice,
      description: req.body.description,
      Stock: req.body.stock,
      image: img,
      category: req.body.category,
    });

    const productdata = await Product.save();
    if (productdata) {
      res.status(200).redirect("/admin/products");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const unlistProduct = async (req, res) => {
  try {
    const ProductId = req.body.productId;
    const productData = await product.findOne({ _id: ProductId });
    productData.is_listed = false;

    const UL = await productData.save();

    res.status(200).json({ message: "product unlisted" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const listProduct = async (req, res) => {
  try {
    const ProductId = req.body.productId;
    const productData = await product.findOne({ _id: ProductId });
    productData.is_listed = true;

    const UL = await productData.save();

    res.status(200).json({ message: "product unlisted" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadproductedit = async (req, res) => {
  try {
    const productid = req.query.id;

    const allproduct = await product.findOne({ _id: productid });
    res
      .status(200)
      .render("adminView/editProduct", { product: allproduct, productid });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteimg = async (req, res) => {
  try {
    const { img, productID } = req.body;

    const dltImage = await product.findOneAndUpdate(
      { _id: productID },
      { $pull: { image: img } }
    );
    if (dltImage) {
      res.status(200).json({ value: 0 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const cropImage = async (req, res) => {
  try {
    const img = req.query.img;
    const productId = req.query.id;

    res.status(200).render("adminView/crop", { img, productId });
  } catch (error) {
    console.log(error.message);
  }
};

const editproduct = async (req, res) => {
  try {
    console.log(req.body.stock);
    console.log(req.body.description);
    const img = [];
    for (let i = 0; i < req.files.length; i++) {
      img.push(req.files[i].filename);
    }

    if (img.length > 0) {
      const updateProductWithIMG = await product.findOneAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            productName: req.body.productName,
            actualPrice: req.body.actualPrice,
            image: img, // Assuming img is the field in your request body containing the image data
            description: req.body.description,
            Stock: req.body.stock,
            category: req.body.category,
          },
        }
      );
    } else {
      const updateProduct = await product.findOneAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            productName: req.body.productName,
            actualPrice: req.body.actualPrice,
            description: req.body.description,
            Stock: req.body.stock,
            category: req.body.category,
          },
        }
      );
    }

    res.status(200).redirect("/admin/products");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loadOrders = async (req, res) => {
  try {
    let srt = 1;
    if (req.query.srt) {
      let request = req.query.srt;
      srt = parseInt(request, 10);
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    let limit = 10;

    const orders = await Orders.find({})
      .sort({ orderedDate: srt })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("products.productId")
      .exec();

    const count = await Orders.find({}).countDocuments();

    res.status(200).render("adminView/orders", {
      orders,
      count,
      totalpage: Math.ceil(count / limit),
      currentpage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrderDetail = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orders = await Orders.findOne({ _id: orderId.trim() }).populate(
      "products.productId"
    );

    if (orders) {
      res.status(200).render("adminView/orderDetails", { orders });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const setSatus = async (req, res) => {
  try {
    const { selectedValue, orderid, productid } = req.body;

    const order = await Orders.findOne({ _id: orderid });
    const product = await order.products.find(
      (product) => product.productId.toString() === productid
    );
    product.orderStatus = selectedValue;
    const statusChanged = await order.save();
    if (statusChanged) {
      res.status(200).json({ value: 1 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const chartdata = async (req, res) => {
  try {
    const time = req.query.time;

    let timeFrame = new Date(new Date().setHours(0, 0, 0, 0));
    let pipeline = [
      {
        $match: {
          orderedDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          orderCount: 1,
          label: "Today",
        },
      },
    ];

    if (time === "weekly") {
      timeFrame = new Date(
        new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 86400000
      );

      pipeline = [
        {
          $match: {
            orderDate: {
              $gte: new Date(
                new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 86400000
              ),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$orderedDate" },
            totalAmount: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            label: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 1] }, then: "Sunday" },
                  { case: { $eq: ["$_id", 2] }, then: "Monday" },
                  { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
                  { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
                  { case: { $eq: ["$_id", 5] }, then: "Thursday" },
                  { case: { $eq: ["$_id", 6] }, then: "Friday" },
                  { case: { $eq: ["$_id", 7] }, then: "Saturday" },
                ],
                default: "Unknown",
              },
            },
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];
    }

    if (time === "monthly") {
      timeFrame = new Date(new Date().getFullYear(), 0, 1);

      pipeline = [
        {
          $match: {
            orderedDate: {
              $gte: new Date(new Date().setDate(1)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$orderedDate" },
            totalAmount: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            label: {
              $dateToString: {
                format: "%B",
                date: {
                  $dateFromParts: {
                    year: new Date().getFullYear(),
                    month: "$_id",
                  },
                },
              },
            }, // Format month name
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];
    }

    if (time === "yearly") {
      const currentYear = new Date().getFullYear();
      const firstYear = currentYear - 4;

      timeFrame = new Date(firstYear, 0, 1);

      pipeline = [
        {
          $match: {
            orderedDate: {
              $gte: new Date(firstYear, 0, 1),
              $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        {
          $group: {
            _id: { $year: "$orderedDate" },
            totalAmount: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            label: "$_id",
            totalAmount: 1,
            orderCount: 1,
          },
        },
        {
          $sort: { label: 1 },
        },
      ];
    }

    // payment method
    const paymentMethods = await Orders.aggregate([
      { $match: { orderedDate: { $gte: timeFrame } } },
      { $group: { _id: "$paymentMethod", orderCount: { $sum: 1 } } },
    ]);

    const payment = {
      online:
        paymentMethods.find(({ _id }) => _id === "online")?.orderCount ?? 0,
      cod: paymentMethods.find(({ _id }) => _id === "COD")?.orderCount ?? 0,
      wallet:
        paymentMethods.find(({ _id }) => _id === "wallet")?.orderCount ?? 0,
    };

    const Categories = await Orders.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", // The name of the "products" collection
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: { $sum: "$products.quantity" },
        },
      },
    ]);

    const salesByCat = Categories.reduce((result, item) => {
      result[item._id] = item.totalSales;
      return result;
    }, {});

    // sales
    const salesDetails = await Orders.aggregate(pipeline);

    const sales = {
      totalAmount: 0,
      orderCount: [],
      label: [],
    };

    sales.totalAmount = salesDetails.reduce((acc, { totalAmount }) => {
      return acc + Number(totalAmount);
    }, 0);
    sales.orderCount = salesDetails.map(({ orderCount }) => orderCount);
    sales.label = salesDetails.map(({ label }) => label);

    res.status(200).json({ salesDetails, sales, payment, salesByCat });
  } catch (error) {
    console.log(error.message);
  }
};

const loadSalesReport = async (req, res) => {
  try {
    res.status(200).render("adminView/salesReport");
  } catch (error) {
    console.log(error.message);
  }
};

const reportData = async (req, res) => {
  try {
    const startingDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);

    const salesData = await Orders.aggregate([
      { $match: { orderedDate: { $gte: startingDate, $lte: endDate } } },
    ]);

    if (salesData) {
      res.status(200).json({ salesData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const dowloadReport = async (req, res) => {
  try {
    const startingDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);

    const salesReportData = await Orders.aggregate([
      { $match: { orderedDate: { $gte: startingDate, $lte: endDate } } },
    ]);

    if (salesReportData) {
      res.status(200).json({ salesReportData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadAdminLogin,
  LoginVerify,
  // loadAdminRegister,
  // insertAdminData,
  adminLogOut,
  loadHome,
  loadCustomers,
  loadCategory,
  addCategory,
  loadProducts,
  loadBlockUser,
  loadunblockUser,
  unlistCategory,
  listCategory,
  loadEdit,
  Edit,
  loadAddProduct,
  insertProduct,
  unlistProduct,
  listProduct,
  loadproductedit,
  deleteimg,
  editproduct,
  loadOrders,
  loadOrderDetail,
  setSatus,
  cropImage,
  chartdata,
  loadSalesReport,
  reportData,
  dowloadReport,
};
