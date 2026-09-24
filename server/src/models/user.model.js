const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    avatarUrl: { type: String, trim: true, default: "" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Series" }],
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Series" }],
  },
  { timestamps: true }
);

userSchema
  .virtual("initials")
  .get(function getInitials() {
    return this.displayName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  });

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
