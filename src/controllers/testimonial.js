const responseHelper = require("../helpers/sendResponse");
const testimonialModel = require("../models/testimonial");

const listTestimonial = (req, res) => {
  const { query } = req;
  testimonialModel
    .listTestimonialModel(query)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

module.exports = {
  listTestimonial,
};
