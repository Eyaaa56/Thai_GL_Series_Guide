const mongoose = require("mongoose");

const planItemSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: "Series", required: true },
    episodeCount: { type: Number, required: true, min: 1 },
    completedEpisodes: [{ type: Number, min: 1 }],
    note: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: true }
);

const watchPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    items: { type: [planItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchPlan", watchPlanSchema);
