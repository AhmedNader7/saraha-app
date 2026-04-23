import rateLimit from "express-rate-limit";

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  ...commonOptions,
});

export const strictMessageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many anonymous messages. Please try again in a minute.",
  },
  ...commonOptions,
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
  },
  ...commonOptions,
});

export default {
  globalRateLimiter,
  strictMessageRateLimiter,
  authRateLimiter,
};
