const express = require("express");
const testimonialRouter = express.Router();
const testimonialController = require("../controllers/testimonial");

testimonialRouter.get("/", testimonialController.listTestimonial);

module.exports = testimonialRouter;
