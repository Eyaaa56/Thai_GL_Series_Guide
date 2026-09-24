const Series = require("../models/series.model");
const Rating = require("../models/rating.model");
const Comment = require("../models/comment.model");

const getSeries = async (req, res, next) => {
  try {
    const filter = req.query.category ? { categories: req.query.category } : {};
    const series = await Series.find(filter).sort({ averageRating: -1, ratingCount: -1 });
    res.json(series);
  } catch (error) {
    next(error);
  }
};

const createSeries = async (req, res, next) => {
  try {
    const series = await Series.create(req.body);
    res.status(201).json(series);
  } catch (error) {
    next(error);
  }
};

const updateSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!series) return res.status(404).json({ message: "Series not found" });
    res.json(series);
  } catch (error) { next(error); }
};

const deleteSeries = async (req, res, next) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ message: "Series not found" });
    await Rating.deleteMany({ series: series._id });
    await Comment.deleteMany({ series: series._id });
    res.status(204).end();
  } catch (error) { next(error); }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const leaderboard = await Series.find({ ratingCount: { $gt: 0 } })
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(limit)
      .select("title posterUrl categories averageRating ratingCount");
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

const upsertRating = async (req, res, next) => {
  try {
    const { stars, review } = req.body;
    const userId = req.user._id;

    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: "Series not found" });

    const rating = await Rating.findOneAndUpdate(
      { user: userId, series: series._id },
      { stars, review, user: userId, series: series._id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const summary = await Rating.aggregate([
      { $match: { series: series._id } },
      { $group: { _id: "$series", averageRating: { $avg: "$stars" }, ratingCount: { $sum: 1 } } },
    ]);
    await Series.findByIdAndUpdate(series._id, {
      averageRating: Number(summary[0].averageRating.toFixed(2)),
      ratingCount: summary[0].ratingCount,
    });

    res.json(rating);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSeries, createSeries, updateSeries, deleteSeries, getLeaderboard, upsertRating };
