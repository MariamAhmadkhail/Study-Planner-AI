const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000; // <-- Add this lineess.env.PORT || 19847;

// Serve static files from the "public" folder
app.use(express.static("public"));

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// New routes for Checkpoint #02
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/create-task", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "create-task.html"));
});

app.get("/edit-task", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "edit-task.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profile.html"));
});

app.get("/ai-planner", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "ai-planner.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.get("/checkpoints", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "checkpoints.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
