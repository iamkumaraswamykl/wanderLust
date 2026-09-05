const joi = require("joi");

module.exports = joi.object({
  listing: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      location: joi.string(),
      country: joi.string().required(),
      price: joi.number().required(),
      image: joi.string().allow("", null),
    })
    .required(),
});
