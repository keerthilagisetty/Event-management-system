const express = require("express");
const router1 = express.Router();
const { check } = require("express-validator");
const eventController = require("../controllers/event-controller");

router1.get("/", eventController.getAllEvents);
router1.post("/addevents", [
  check("name").notEmpty(),
  check("date").isISO8601(),
], eventController.addEvent);
router1.get("/:id", eventController.getById);
router1.put("/:id", eventController.updateEvent);
router1.delete("/:id", eventController.deleteEvent);

module.exports = router1;
