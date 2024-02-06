var express = require('express');
var router = express.Router();
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  }
});

// const fileFilter = function (req, file, cb) {
//   if (file.minetype === 'image/jpeg' || file.minetype === 'image/png' || file.minetype === 'image/jpg') {
//     cb(null, true);
//     return;
//   } else {
//     cb(new Error("Please Upload jpeg Or png Image"), false);
//     return;
//   }
// }

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,//5 MB
  },
  // fileFilter: fileFilter,
});



/* GET home page. */
router.get("/error", (req, res, next) => {
  var errPage = req.flash('error');
  res.render('custom-error', { title: 'Shop-Cart', err: errPage });
});
router.get('/', function (req, res, next) {
  var success = req.flash('success');
  var expired = req.flash('errorCart');
  Product.find({})
    .then((docs) => {
      var colGrid = 3;
      var productGrid = [];
      for (var x = 0; x < docs.length; x += colGrid) {
        productGrid.push(docs.slice(x, x + colGrid));
      }
      let checkUser = false;
      var emailUser = "Unknown Email";
      if (req.session.user) {
        checkUser = true;
        emailUser = req.session.user.email;
      } else {
        checkUser = false;
        emailUser: "Unknown Email";
      }
      let selectedProductQuantity = 0;
      if (checkUser) {
        Cart.find({ _id: req.session.user._id })
          .then((cart) => {
            if (cart.length > 0) {
              selectedProductQuantity = cart[0].totalQuantity;
              res.render('index', { success: success, title: 'Shop-Cart', products: productGrid, checkUser: checkUser, emailUser: emailUser, selectedProduct: selectedProductQuantity, expired: expired });
            } else {
              res.render('index', { success: success, title: 'Shop-Cart', products: productGrid, checkUser: checkUser, emailUser: emailUser, selectedProduct: 0, expired: expired });
            }
          })
          .catch((err) => {
            req.flash('error', err.message);
            res.redirect("/error");
          });
      }
      else {
        res.render('index', { success: success, title: 'Shop-Cart', products: productGrid, checkUser: checkUser, emailUser: emailUser, selectedProduct: 0, expired: expired });
      }

    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect("/error");
    })
});


router.get("/addProduct/:id/:name/:price", (req, res, next) => {
  const product = {
    _id: req.params.id,
    name: req.params.name,
    price: parseInt(req.params.price, 10),
    quantity: 1,
  }
  const cartID = req.session.user._id;
  Cart.findById(cartID)
    .then((cart) => {
      if (!cart) {
        const cart = new Cart({
          _id: cartID,
          totalQuantity: 1,
          totalPrice: parseInt(req.params.price, 10),
          selectedProduct: [product],
          createAt: Date.now(),
        });
        cart.save()
          .then((cart) => {
            let selectedProductQuantity = 0;
            if (req.session.user) {
              Cart.find({ _id: req.session.user._id })
                .then((cart) => {
                  selectedProductQuantity = cart[0].totalQuantity;
                  res.redirect("/");
                  return;
                })
                .catch((err) => {
                  req.flash('error', err.message);
                  res.redirect("/error");
                });
            }
            else {
              res.redirect("/");
            }
          }).catch((err) => {
            req.flash('error', err.message);
            res.redirect("/error");
          })
      }
      if (cart) {
        var indexOfProduct = -1;
        for (var i = 0; i < cart.selectedProduct.length; i++) {
          if (cart.selectedProduct[i]._id === req.params.id) {
            indexOfProduct = i;
            break;
          }
        }
        if (indexOfProduct >= 0) {
          cart.selectedProduct[indexOfProduct].quantity = cart.selectedProduct[indexOfProduct].quantity + 1;
          cart.selectedProduct[indexOfProduct].price = cart.selectedProduct[indexOfProduct].price + parseInt(req.params.price, 10);
          cart.totalQuantity = cart.totalQuantity + 1;
          cart.totalPrice = cart.totalPrice + parseInt(req.params.price, 10);
          cart.createAt = Date.now();
          Cart.updateOne({ _id: cartID }, { $set: cart })
            .then((doc) => {
              res.redirect("/");
            })
            .catch((err) => {
              req.flash('error', err.message);
              res.redirect("/error");
            });
        } else {
          cart.totalQuantity = cart.totalQuantity + 1;
          cart.totalPrice = cart.totalPrice + parseInt(req.params.price, 10);
          cart.selectedProduct.push(product);
          cart.createAt = Date.now();
          Cart.updateOne({ _id: cartID }, { $set: cart })
            .then((doc) => {
              res.redirect("/");
            })
            .catch((err) => {
              req.flash('error', err.message);
              res.redirect("/error");
            })
        }
      }
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect("/error");
    });

});

router.get("/shoping-cart", (req, res, next) => {
  if (req.session.user) {
    Cart.find({ _id: req.session.user._id })
      .then((carts) => {
        if (carts.length > 0) {
          let checkUser = true;
          var emailUser = req.session.user.email;
          var selectedProductQuantity = carts[0].totalQuantity;
          res.render('shopingCart', { cart: carts, checkUser: checkUser, emailUser: emailUser, selectedProduct: selectedProductQuantity });
        } else {
          res.redirect("/");
        }
      }).catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  } else {
    res.redirect("/users/signin");
  }
});

router.get("/increaseProduct/:index", (req, res, next) => {
  const index = req.params.index;
  const userCart = req.session.user._id;
  Cart.findById(userCart).then((cart) => {
    const productPrice = cart.selectedProduct[index].price / cart.selectedProduct[index].quantity;
    cart.selectedProduct[index].quantity = cart.selectedProduct[index].quantity + 1;
    cart.selectedProduct[index].price = cart.selectedProduct[index].price + productPrice;
    cart.totalQuantity = cart.totalQuantity + 1;
    cart.totalPrice = cart.totalPrice + productPrice;
    cart.createAt = Date.now();
    Cart.updateOne({ _id: userCart }, { $set: cart })
      .then((cartUpdate) => {
        res.redirect("/shoping-cart")
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  }).catch((err) => {
    req.flash('error', err.message);
    res.redirect("/error");
  });

});

router.get("/decreaseProduct/:index", (req, res, next) => {
  const index = req.params.index;
  const userCart = req.session.user._id;
  Cart.findById(userCart).then((cart) => {
    const productPrice = cart.selectedProduct[index].price / cart.selectedProduct[index].quantity;
    cart.selectedProduct[index].quantity = cart.selectedProduct[index].quantity - 1;
    cart.selectedProduct[index].price = cart.selectedProduct[index].price - productPrice;
    cart.totalQuantity = cart.totalQuantity - 1;
    cart.totalPrice = cart.totalPrice - productPrice;
    cart.createAt = Date.now();
    Cart.updateOne({ _id: userCart }, { $set: cart })
      .then((cartUpdate) => {
        res.redirect("/shoping-cart");
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  }).catch((err) => {
    req.flash('error', err.message);
    res.redirect("/error");
  });

});

router.get("/deleteProduct/:index", (req, res, next) => {
  const index = req.params.index;
  const userCart = req.session.user._id;
  Cart.findById(userCart).then((cart) => {
    cart.createAt = Date.now();
    if (cart.selectedProduct.length <= 1) {
      Cart.deleteOne({ _id: userCart }).then((resault) => {
        res.redirect("/");
      }).catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
    } else {
      cart.totalQuantity = cart.totalQuantity - cart.selectedProduct[index].quantity;
      cart.totalPrice = cart.totalPrice - cart.selectedProduct[index].price;
      cart.selectedProduct.splice(index, 1);
      cart.createAt = Date.now();
      Cart.updateOne({ _id: userCart }, { $set: cart })
        .then((cart) => {
          res.redirect("/shoping-cart");
        }).catch((err) => {
          req.flash('error', err.message);
          res.redirect("/error");
        })
    }
  }).catch((err) => {
    req.flash('error', err.message);
    res.redirect("/error");
  });
});

router.get("/checkout", (req, res, next) => {
  let checkUser = false;
  var emailUser = "Unknown Email";
  var validationMessage = req.flash('errorsCredit');
  if (req.session.user) {
    checkUser = true;
    emailUser = req.session.user.email;
  } else {
    checkUser = false;
    emailUser: "Unknown Email";
    res.redirect("/");
  }
  var totalPrice = 0;
  Cart.findById(req.session.user._id).then((resault) => {
    if (resault) {
      totalPrice = resault.totalPrice;
    } else {
      req.flash('errorCart', 'This Cart Is Expired');
      res.redirect('/');
    }

  }).catch((err) => {
    req.flash('error', err.message);
    res.redirect("/error");
  });
  let selectedProductQuantity = 0;
  if (checkUser) {
    Cart.find({ _id: req.session.user._id })
      .then((cart) => {
        if (req.session.user.userName === undefined || req.session.user.contact === undefined || req.session.user.address === undefined) {
          req.flash('profileErrors', 'Please Update Your Information Before Do Order');
          res.redirect("/users/profile");
          return;
        }
        else {
          if (cart.length > 0) {
            selectedProductQuantity = cart[0].totalQuantity;
            res.render('checkout', { message: validationMessage, title: 'Shop-Cart', checkUser: checkUser, emailUser: emailUser, selectedProduct: selectedProductQuantity, totalPrice: totalPrice, user: req.session.user });
          } else {
            res.render('checkout', { message: validationMessage, title: 'Shop-Cart', checkUser: checkUser, emailUser: emailUser, selectedProduct: 0, totalPrice: totalPrice, user: req.session.user });
          }
        }

      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  }
  else {
    res.render('checkout', { message: validationMessage, title: 'Shop-Cart', checkUser: checkUser, emailUser: emailUser, selectedProduct: 0, totalPrice: totalPrice, user: req.session.user });
  }
});

router.post("/checkout", (req, res, next) => {
  var errors = [];
  if (req.body.name === "") {
    errors.push('Please Enter Your Name');
  }
  if (req.body.address === "") {
    errors.push('Please Enter Your Address');
  }
  if (req.body.creditCartName === "") {
    errors.push('Please Enter Your Credit Name');
  }
  if (req.body.creditCartNumber === "") {
    errors.push('Please Enter Your Credit Number');
  }
  if (req.body.expirationMonth === "") {
    errors.push('Please Enter Your Credit Expiration Month');
  }
  if (req.body.expirationYear === "") {
    errors.push('Please Enter Your Credit Expiration Year');
  }
  if (req.body.cvc === "") {
    errors.push('Please Enter Your Credit Expiration CVC');
  }
  if (errors.length > 0) {
    var validationMessage = [];
    for (var x = 0; x < errors.length; x++) {
      validationMessage.push(errors[x]);
    }
    req.flash('errorsCredit', validationMessage);
    res.redirect("/checkout");
  } else {
    Cart.findById(req.session.user._id)
      .then((resault) => {
        //Save Order
        const order = new Order({
          user: req.session.user._id,
          cart: resault,
          address: req.body.address,
          name: req.body.name,
          orderPrice: resault.totalPrice,
          contact: req.body.contact,
        });
        order.save()
          .then((docs) => {
            //Delete The Cart
            Cart.deleteOne({ _id: req.session.user._id })
              .then((docs) => {
                req.flash('success', 'Succefually Bought Products');
                res.redirect("/");
              }).catch((err) => {
                req.flash('error', err.message);
                res.redirect("/error");
              });
          }).catch((err) => {
            req.flash('error', err.message);
            res.redirect("/error");
          })
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  }

});

router.post("/uploadFile", upload.single('myfile'), (req, res, next) => {
  const path = "./public" + req.session.user.image;
  if (path === './public/upload/avatar.jpg') {
    const updatedUser = {
      _id: req.session.user._id,
      email: req.session.user.email,
      password: req.session.user.password,
      userName: req.session.user.userName,
      contact: req.session.user.contact,
      address: req.session.user.address,
      image: req.file.path.slice(6),
    };
    User.updateOne({ _id: req.session.user._id }, { $set: updatedUser })
      .then((docs) => {
        req.session.user = updatedUser;
        res.redirect("/users/profile");
      })
      .catch((err) => {
        req.flash('error', err.message);
        res.redirect("/error");
      });
  } else {
    fs.unlink(path, (err) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect("/error");
        return;
      }
      else {
        const updatedUser = {
          _id: req.session.user._id,
          email: req.session.user.email,
          password: req.session.user.password,
          userName: req.session.user.userName,
          contact: req.session.user.contact,
          address: req.session.user.address,
          image: req.file.path.slice(6),
        };
        User.updateOne({ _id: req.session.user._id }, { $set: updatedUser })
          .then((docs) => {
            req.session.user = updatedUser;
            res.redirect("/users/profile");
          })
          .catch((err) => {
            req.flash('error', err.message);
            res.redirect("/error");
          });
      }
    }

    );
  }


});


module.exports = router;
