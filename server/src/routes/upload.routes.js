const express = require("express");
const { uploadCover } = require("../controllers/upload.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", protect, authorize("admin"), uploadCover);

module.exports = router;
