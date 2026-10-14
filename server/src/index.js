import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

connectDB()
  .then(() => app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`)))
  .catch((e) => {
    console.error("Could not connect to MongoDB:", e.message);
    console.error("Start MongoDB locally or set MONGO_URI in server/.env (e.g. a MongoDB Atlas connection string).");
    process.exit(1);
  });
