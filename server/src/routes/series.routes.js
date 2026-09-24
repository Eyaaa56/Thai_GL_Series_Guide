const express = require("express");
const { getSeries, createSeries, updateSeries, deleteSeries, getLeaderboard, upsertRating } = require("../controllers/series.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/", getSeries);
router.post("/", protect, authorize("admin"), createSeries);
router.patch("/:id", protect, authorize("admin"), updateSeries);
router.delete("/:id", protect, authorize("admin"), deleteSeries);
router.put("/:id/rating", protect, upsertRating);

module.exports = router;
