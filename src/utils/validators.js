import Joi from "joi";

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  publicUsername: Joi.string().alphanum().min(3).max(30).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  password: Joi.string().min(6).required(),
  publicUsername: Joi.string().alphanum().min(3).max(30).required(),
});

export const messageSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

export const refreshSchema = Joi.object({}).unknown(true); // Cookie-based

export default {
  signupSchema,
  loginSchema,
  otpSchema,
  messageSchema,
};
