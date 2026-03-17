import Joi from "joi";

/**
 * Validation middleware using Joi
 * @param {object} schema - Joi schema
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details,
    });
  }

  req.body = value;
  next();
};

export default validate;
