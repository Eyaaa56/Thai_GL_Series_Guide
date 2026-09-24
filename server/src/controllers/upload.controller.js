const jwt = require("jsonwebtoken");
const { handleUpload } = require("@vercel/blob/client");
const User = require("../models/user.model");

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const uploadCover = async (req, res, next) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ message: "Blob storage is not configured. Connect a Vercel Blob store to this project." });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN.trim();
    const jsonResponse = await handleUpload({
      token: blobToken,
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("series-covers/")) throw new Error("Invalid upload path");

        let token;
        try {
          token = JSON.parse(clientPayload || "{}").token;
        } catch {
          throw new Error("Authentication required");
        }
        if (!token || !process.env.JWT_SECRET) throw new Error("Authentication required");

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub).select("role");
        if (!user || user.role !== "admin") throw new Error("Administrator permission required");

        return {
          allowedContentTypes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user._id.toString() }),
        };
      },
    });
    res.status(200).json(jsonResponse);
  } catch (error) {
    // handleUpload callbacks are retried by Blob when they do not receive 200.
    res.status(400).json({ message: error.message || "Unable to authorize upload" });
  }
};

module.exports = { uploadCover };
