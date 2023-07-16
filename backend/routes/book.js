const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const bookCtrl = require("../controllers/book");
const multer = require("../middlewares/multer-config");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestrating);
router.get("/:id", bookCtrl.getOneBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.createRating);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;