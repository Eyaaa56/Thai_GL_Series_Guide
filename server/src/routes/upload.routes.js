const express = require("express");
const { uploadCover } = require("../controllers/upload.controller");

const router = express.Router();

// The Blob SDK token request cannot attach the application's Authorization
// header. uploadCover verifies the JWT carried in its signed client payload
// before it grants an upload token.
router.post("/", uploadCover);

module.exports = router;
