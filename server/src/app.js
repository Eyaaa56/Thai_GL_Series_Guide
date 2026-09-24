const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const seriesRoutes = require("./routes/series.routes");
const userRoutes = require("./routes/user.routes");
const watchPlanRoutes = require("./routes/watchPlan.routes");
const commentRoutes = require("./routes/comment.routes");
const uploadRoutes = require("./routes/upload.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const app = express();

// 1. Global middleware
app.use(cors());
app.use(express.json({ limit: "3mb" }));
app.use("/api/uploads", express.raw({ type: ["image/jpeg", "image/png", "image/webp", "image/gif"], limit: "4mb" }), uploadRoutes);

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tracks", trackRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watch-plans", watchPlanRoutes);
app.use("/api/series/:seriesId/comments", commentRoutes);

// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
