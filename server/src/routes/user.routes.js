const express = require("express");
const { register, login, getMe, updateMe, toggleFavorite, toggleWatchlist } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/me/favorites/:seriesId", protect, toggleFavorite);
router.patch("/me/watchlist/:seriesId", protect, toggleWatchlist);

module.exports = router;
