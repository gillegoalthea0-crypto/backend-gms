require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB error:", err));

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const path = require("path");

const handleStudentsRoute = require("./routes/students");
const handleGradesRoute = require("./routes/grades");
const handleSubjectsRoute = require("./routes/subjects");
const handleStatsRoute = require("./routes/stats");

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));
app.use(passport.initialize());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.all("/api/*path", async (req, res) => {
  const method = req.method;
  const pathname = req.path;
  const requestUrl = new URL(req.url, "http://localhost");

  const context = { method, pathname, requestUrl, req, res, passingPercentage: 60 };

  try {
    if (await handleStudentsRoute(context)) return;
    if (await handleGradesRoute(context)) return;
    if (await handleSubjectsRoute(context)) return;
    if (await handleStatsRoute(context)) return;
    res.status(404).json({ message: "Route not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "GMS API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});