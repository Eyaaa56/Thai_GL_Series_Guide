const crypto = require("crypto");
const { put } = require("@vercel/blob");

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const uploadCover = async (req, res, next) => {
  try {
    const contentType = req.get("content-type")?.split(";", 1)[0].toLowerCase();
    const extension = extensions[contentType];
    if (!extension) return res.status(415).json({ message: "Only JPG, PNG, WEBP, and GIF images are allowed" });
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ message: "Select an image to upload" });
    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      return res.status(500).json({ message: "Blob storage is not configured. Connect a Vercel Blob store to this project." });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN.trim();
    const blob = await put(`series-covers/${Date.now()}-${crypto.randomUUID()}.${extension}`, req.body, {
      token: blobToken,
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    res.status(201).json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadCover };
