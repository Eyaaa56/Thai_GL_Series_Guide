const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    series: { type: mongoose.Schema.Types.ObjectId, ref: "Series", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// A member can have only one rating per series; updating it replaces their vote.
ratingSchema.index({ user: 1, series: 1 }, { unique: true });
ratingSchema.index({ series: 1, stars: -1 });

module.exports = mongoose.model("Rating", ratingSchema);
