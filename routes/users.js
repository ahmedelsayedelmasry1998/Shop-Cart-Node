var express = require('express');
var router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const Cart = require("../models/cart");
const Order = require("../models/order");

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get("/signup", isNotSignIn, (req, res, next) => {
  var messagesError = req.flash('errors');
  var emailUser = "Unknown Email";
  let selectedProductQuantity = 0;
  if (req.session.user) {
    emailUser = req.session.user.email;
    Cart.find({ _id: req.session.user._id })
      .then((cart) => {
        selectedProductQuantity = cart[0].totalQuantity;
        return;
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
    res.render('user/signup', { messages: messagesError, emailUser: emailUser, selectedProduct: selectedProductQuantity });
  } else {
    emailUser: "Unknown Email";
    res.render('user/signup', { messages: messagesError, emailUser: emailUser, selectedProduct: 0 });
  }
});

router.post("/signup", (req, res, next) => {
  var errors = [];
  if (req.body.email === "") {
    errors.push("Please Enter Your Email")
  }
  if (req.body.password === "") {
    errors.push("Please Enter Your Password")
  }
  if (req.body.password.length < 5) {
    errors.push("Please Enter Your Password More Than 4 Characture")
  }
  if (req.body.password !== req.body.confirmPassword) {
    errors.push("Please Enter Password And Confirm Password Matched")
  }
  if (errors.length > 0) {

    var validationMessages = [];
    for (var x = 0; x < errors.length; x++) {
      validationMessages.push(errors[x]);
    }
    req.flash('errors', validationMessages);
    res.redirect("/users/signup");
  } else {
    User.findOne({ email: req.body.email })
      .then((resault) => {
        if (resault) {
          req.flash('errors', 'This Email Is Already Exisit');
          res.redirect("/users/signup");
          return;
        } else {
          const user = new User({
            email: req.body.email,
            password: req.body.password,
          });
          user.save().then((user) => {
            res.redirect("/users/signin");
          })
            .catch((err) => {
              req.flash('error', err.message);
              res.redirect("/error");
            });
        }
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      })
  }
});

router.get("/signin", isNotSignIn, (req, res, next) => {
  var messagesError = req.flash('signinError');
  var emailUser = "Unknown Email";
  if (req.session.user) {
    emailUser = req.session.user.email;

    let selectedProductQuantity = 0;
    if (req.session.user) {
      emailUser = req.session.user.email;
      Cart.find({ _id: req.session.user._id })
        .then((cart) => {
          if (cart.length > 0) {
            selectedProductQuantity = cart[0].totalQuantity;
            res.render('user/signin', { messages: messagesError, emailUser: emailUser, selectedProduct: selectedProductQuantity });
          } else {
            res.render('/user/signin', { messages: messagesError, emailUser: emailUser, selectedProduct: 0 });
          }
        })
        .catch((err) => {
          req.flash('error', err.message);
          res.redirect("/error");
        });

    }
  } else {
    emailUser: "Unknown Email";
    res.render('user/signin', { messages: messagesError, emailUser: emailUser, selectedProduct: 0 });
  }

});

router.post("/signin", (req, res, next) => {
  User.find({ email: req.body.email, password: req.body.password }).
    then((user) => {
      if (user.length <= 0) {
        req.flash('signinError', 'Please Enter A Vaild Email And Password');
        res.redirect("/users/signin")
      }
      else {
        req.session.user = user[0];
        res.redirect("/users/profile")
      }
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect("/error");
    })
});

router.get("/profile", isSignIn, (req, res, next) => {
  var profileErrors = req.flash('profileErrors');
  var hasMessageError = false;
  if (profileErrors.length > 0) {
    hasMessageError = true;
  }
  var emailUser = "Unknown Email";
  if (req.session.user) {
    emailUser = req.session.user.email;
    let selectedProductQuantity = 0;
    Cart.find({ _id: req.session.user._id })
      .then((cart) => {
        if (cart.length > 0) {
          selectedProductQuantity = cart[0].totalQuantity;
          Order.find({ user: req.session.user._id })
            .then((resault) => {
              res.render("user/profile", { user: req.session.user, checkUser: true, checkProfile: true, emailUser: emailUser, selectedProduct: selectedProductQuantity, userOrder: resault, profileErrors: profileErrors, hasMessageError: hasMessageError });
            }).catch((err) => {
              req.flash('error', err.message);
              res.redirect("/error");
            })
        } else {
          res.render("user/profile", { user: req.session.user, checkUser: true, checkProfile: true, emailUser: emailUser, selectedProduct: 0, profileErrors: profileErrors, hasMessageError: hasMessageError });
        }
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  } else {
    emailUser: "Unknown Email";
    res.render("user/profile", { user: req.session.user, checkUser: true, checkProfile: true, emailUser: emailUser, selectedProduct: 0, profileErrors: profileErrors, hasMessageError: hasMessageError });
  }

});



router.get("/logout", isSignIn, (req, res, next) => {
  var emailUser = "Unknown Email";
  if (req.session.user) {
    emailUser = req.session.user.email;
  } else {
    emailUser: "Unknown Email";
  }
  req.session.destroy();
  res.redirect("/");
});

function isSignIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/users/signin");
  }
}
function isNotSignIn(req, res, next) {
  if (req.session.user) {
    res.redirect("/");
    return;
  } else {
    next();
  }
}
router.post("/updateUser", (req, res, next) => {
  var errors = [];
  if (req.body.email === "") {
    errors.push("Please Enter Your Email")
  }
  if (req.body.username === "") {
    errors.push("Please Enter Your User Name")
  }
  if (req.body.contact === "") {
    errors.push("Please Enter Your Contact")
  }
  if (req.body.address === "") {
    errors.push("Please Enter Your Address")
  }
  if (req.body.password === "") {
    errors.push("Please Enter Your Password")
  }
  if (req.body.password.length < 5) {
    errors.push("Please Enter Your Password More Than 4 Characture")
  }
  if (req.body.password !== req.body.confirmPassword) {
    errors.push("Please Enter Password And Confirm Password Matched")
  }
  if (errors.length > 0) {
    var validationMessages = [];
    for (var x = 0; x < errors.length; x++) {
      validationMessages.push(errors[x]);
    }
    req.flash('profileErrors', validationMessages);
    console.log(validationMessages);
    res.redirect("/users/profile");
  } else {
    User.find({ email: req.body.email })
      .then((doc) => {
        if (doc.length <= 0) {
          const updatedUser = {
            userName: req.body.username,
            email: req.body.email,
            contact: req.body.contact,
            address: req.body.address,
            password: req.body.password,
            _id: req.session.user._id,
          }
          User.updateOne({ _id: req.session.user._id }, { $set: updatedUser })
            .then((doc) => {
              req.session.destroy();
              res.redirect("/users/signin");
            }).catch((err) => {
              req.flash('error', err.message);
              res.redirect("/error");
            });
          return;
        } else {
          if (doc[0]._id.toString() === (req.session.user._id).toString()) {
            const updatedUser = {
              userName: req.body.username,
              email: req.body.email,
              contact: req.body.contact,
              address: req.body.address,
              password: req.body.password,
              _id: req.session.user._id,
            }
            User.updateOne({ _id: req.session.user._id }, { $set: updatedUser })
              .then((doc) => {
                req.session.destroy();
                res.redirect("/users/signin");
              }).catch((err) => {
                req.flash('error', err.message);
                res.redirect("/error");
              });
            return;
          } else {
            req.flash('profileErrors', 'This Email Already Used');
            res.redirect("/users/profile")
          }
        }
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });

  }
});


module.exports = router;
