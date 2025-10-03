import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import storyRoutes from "./routes/storyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js"
import forgotpwdRoutes from "./routes/forgotpwdRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import minigameRoutes from "./routes/minigameRoutes.js";
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
  origin: ['https://hopeless-opus-git-main-org-istes-projects.vercel.app/', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Routes
app.use("/api/story", storyRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/leaderboard", leaderboardRoutes);  
app.use("/api/forgotpwd", forgotpwdRoutes);
app.use("/api/contactus", contactRoutes);
app.use("/api/minigame", minigameRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Server running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

