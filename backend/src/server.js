import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import citizenRoutes from "./routes/citizen.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";


/*
|--------------------------------------------------------------------------
| Load Environment Variables
|--------------------------------------------------------------------------
*/

dotenv.config();


/*
|--------------------------------------------------------------------------
| Create Express App
|--------------------------------------------------------------------------
*/

const app = express();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json());


app.use(
  express.urlencoded({
    extended: true,
  })
);


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "HackHeritage backend is running",
  });
});


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);
app.use("/api/citizen", citizenRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
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
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});