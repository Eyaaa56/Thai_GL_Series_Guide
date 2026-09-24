const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const controller = require("../controllers/comment.controller");

const router = express.Router({ mergeParams: true });
router.get("/", controller.getComments);
router.post("/", protect, controller.createComment);
router.delete("/:commentId", protect, controller.deleteComment);
module.exports = router;
