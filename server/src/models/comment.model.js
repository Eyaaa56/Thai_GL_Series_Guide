const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: "Series", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  },
  { timestamps: true }
);

commentSchema.index({ series: 1, createdAt: -1 });
module.exports = mongoose.model("Comment", commentSchema);
