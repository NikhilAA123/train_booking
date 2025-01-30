import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { spawn } from "child_process";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import sequelize from "./db.js"; 
import { verifyToken } from "./middleware/auth.js"; 

import trainRouter from "./routes/train.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./admin/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: [process.env.API_URL, "http://localhost:3000"] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(xss());
app.use(cookieParser());

// Connect to MySQL Database
sequelize
  .authenticate()
  .then(() => {
    console.log("[DB] MySQL Connection Successful");
    return sequelize.sync();
  })
  .catch((err) => {
    console.error("[DB] MySQL Connection Error:", err.message);
  });

// Routes
app.use("/api/trains", verifyToken, trainRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// 404 Route handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Schedule task to run seed.js file every day at 9:30 AM IST
cron.schedule("30 4 * * *", () => {
  console.log("Running seed.js file");
  const seed = spawn("node", ["./seed.js"]);

  seed.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  seed.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  seed.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
