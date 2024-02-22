const user = require("../models/UserModel");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.userId) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.userId) {
      return res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isBlock = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const User = await user.findById(req.session.userId);

      if (User && User.is_blocked) {
        res.render("userView/BlockedPage");
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  isLogin,
  isLogout,
  isBlock,
};
