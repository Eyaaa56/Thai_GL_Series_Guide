const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  try {
    // A Vercel rewrite forwards every /api/* request to this one Function.
    // Restore the requested API path before Express matches its routes.
    const requestUrl = new URL(req.url, "http://localhost");
    const forwardedPath = requestUrl.searchParams.get("__path");
    if (forwardedPath && !requestUrl.pathname.startsWith("/api/")) {
      requestUrl.searchParams.delete("__path");
      const query = requestUrl.searchParams.toString();
      req.url = `/api/${forwardedPath}${query ? `?${query}` : ""}`;
    }
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(503).json({ message: "Database is temporarily unavailable" });
  }
};
