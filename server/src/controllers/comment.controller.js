const Comment = require("../models/comment.model");
const Series = require("../models/series.model");

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ series: req.params.seriesId })
      .sort({ createdAt: -1 })
      .populate("user", "displayName avatarUrl initials");
    res.json(comments);
  } catch (error) { next(error); }
};

const createComment = async (req, res, next) => {
  try {
    if (!(await Series.exists({ _id: req.params.seriesId }))) return res.status(404).json({ message: "Series not found" });
    const comment = await Comment.create({ series: req.params.seriesId, user: req.user._id, body: req.body.body });
    await comment.populate("user", "displayName avatarUrl initials");
    res.status(201).json(comment);
  } catch (error) { next(error); }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || !comment.series.equals(req.params.seriesId)) return res.status(404).json({ message: "Comment not found" });
    if (!comment.user.equals(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "You cannot delete this comment" });
    await comment.deleteOne();
    res.status(204).end();
  } catch (error) { next(error); }
};

module.exports = { getComments, createComment, deleteComment };
