const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const controller = require("../controllers/watchPlan.controller");

const router = express.Router();
router.use(protect);
router.route("/").get(controller.getPlans).post(controller.createPlan);
router.route("/:planId").patch(controller.updatePlan).delete(controller.deletePlan);
router.post("/:planId/items", controller.addPlanItem);
router.delete("/:planId/items/:itemId", controller.removePlanItem);
router.patch("/:planId/items/:itemId/episodes/:episode", controller.setEpisode);

module.exports = router;
