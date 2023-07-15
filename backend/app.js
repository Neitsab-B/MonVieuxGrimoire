const express = require("express");
const mongoose = require("mongoose");
const app = express();
const usersRoutes = require("./routes/user");
const booksRoutes = require("./routes/book");

// mongoose connect
mongoose
  .connect(
    "mongodb+srv://Admin:Neitsab-73@grimoiredatabase.8rbng7u.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion to MongoDB : SUCCESS !"))
  .catch(() => console.log("Connexion to MongoDB : FAIL !"));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// links to the routes
app.use("/api/auth", usersRoutes);
app.use("/api/books", booksRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
