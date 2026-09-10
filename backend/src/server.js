import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import citizenRoutes from "./routes/citizen.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/report.routes.js";
import governmentRoutes from "./routes/governmentRoutes.js";
import governmentNotificationRoutes from "./routes/governmentNotificationRoutes.js";
import governmentAnalyticsRoutes from "./routes/governmentAnalyticsRoutes.js";
import { errorHandler } from "./middleware/error.middleware.js";

/*
|--------------------------------------------------------------------------
| Load Environment Variables
|--------------------------------------------------------------------------
*/

dotenv.config();

/*
|--------------------------------------------------------------------------
| ES Module Path Setup
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Create Express App
|--------------------------------------------------------------------------
*/

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Static Uploads
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "JanSamadhan backend is running",
  });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Citizen Routes
|--------------------------------------------------------------------------
*/

app.use("/api/citizen", citizenRoutes);

/*
|--------------------------------------------------------------------------
| Report Routes
|--------------------------------------------------------------------------
*/

app.use("/api/reports", reportRoutes);

/*
|--------------------------------------------------------------------------
| Government Routes
|--------------------------------------------------------------------------
|
| All government APIs start with:
|
| /api/government
|
|--------------------------------------------------------------------------
*/

app.use("/api/government", governmentRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/


app.use(
  "/api/government/notifications",
  governmentNotificationRoutes
);



app.use(
  "/api/government/analytics",
  governmentAnalyticsRoutes
);
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`JanSamadhan backend running on http://localhost:${PORT}`);
});