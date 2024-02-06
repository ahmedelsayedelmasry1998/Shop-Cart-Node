// const passport = require("passport");
// const localStrategy = require("passport-local").Strategy;
// const User = require("../models/user");
// passport.serializeUser((user, done) => {
//     return done(null, user.id);
// });
// passport.deserializeUser((id, done) => {
//     User.findById(id)
//         .then((user) => {
//             return (null, user);
//         })
//         .catch((err) => {
//             return done(err);
//         })
// });

// passport.use("local-signin", new localStrategy({
//     usernameField: "email",
//     passwordField: "password",
//     passReqToCallback: true,
// }, (req, email, password, done) => {
//     User.findOne({ email: email })
//         .then((user) => {
//             if (!user) {
//                 return done(null, false, req.flash('signinError', 'This User Is Not Found'))
//             } else {
//                 if (!user.comparePassword(password)) {
//                     return done(null, false, req.flash('signinError', 'Wrong Password'));
//                 } else {
//                     return done(null, user);
//                 }
//             }
//         })
//         .catch((err) => {
//             return done(err);
//         })
// }));