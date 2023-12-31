const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    // creation of a new user
    .then((hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // register the new user in the data base
      user
        .save()
        .then(() => res.status(201).json({ message: "User created !" }))
        .catch((error) => res.status(400).json({ error }));
    }))
    .catch((error) => res.status(500).json({ error }));
};

// login function
exports.login = (req, res, next) => {
  // research of the user by the email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Wrong Login/Password" });
      }
      // password check
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Wrong Login/Password" });
          }
          // result
          res.status(200).json({
            userId: user._id,
            // use of jsonwebtoken module
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
