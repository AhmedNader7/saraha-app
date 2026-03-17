import Redis from "ioredis";

let redis;

try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  redis.on("connect", () => console.log("Redis Connected"));
} catch (err) {
  console.warn(
    "Redis not available - fallback to Mongo (OTP OK, no token blacklist/caching)",
  );
  redis = {
    get: async () => null,
    setex: async () => {},
    del: async () => {},
  };
}

redis.on("error", (err) => {
  if (err.code === "ECONNREFUSED") {
    console.warn("Redis connection refused - using fallback");
  } else {
    console.error("Redis Client Error", err);
  }
});

export default redis;
