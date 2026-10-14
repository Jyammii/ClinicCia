import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongo: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clinicnow",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

if (env.nodeEnv === "production" && env.jwtSecret === "dev-only-secret-change-me") {
  throw new Error("Set a strong JWT_SECRET in production.");
}
