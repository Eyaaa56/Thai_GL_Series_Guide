const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true, maxlength: 200 },
    originalTitle: { type: String, trim: true, maxlength: 200 },
    synopsis: { type: String, trim: true, maxlength: 3000, default: "" },
    // Accepts a normal image URL or a small data URL created from the admin cover picker.
    posterUrl: { type: String, trim: true, maxlength: 2800000, default: "" },
    watchUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    trailerUrl: { type: String, trim: true, default: "" },
    releaseYear: { type: Number, min: 1900, max: 2100 },
    episodeCount: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ["ongoing", "completed", "upcoming"],
      default: "upcoming",
    },
    categories: [
      {
        type: String,
        enum: ["romance", "drama", "comedy", "school", "fantasy", "historical", "action", "slice-of-life"],
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    actors: [{ type: String, trim: true, maxlength: 120 }],
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

seriesSchema.index({ categories: 1, averageRating: -1 });
seriesSchema.index({ averageRating: -1, ratingCount: -1 });

module.exports = mongoose.model("Series", seriesSchema);
