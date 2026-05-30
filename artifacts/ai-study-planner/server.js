const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Path to users.json
const usersFilePath = path.join(__dirname, "data", "users.json");

// Helper function to read users from JSON file
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Helper function to write users to JSON file
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// GET routes (existing)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

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

// POST route for registration (Checkpoint #04)
app.post("/register", (req, res) => {
  const { name, email, password, confirmPassword, grade } = req.body;

  // Basic validation
  if (!name || !email || !password || !confirmPassword || !grade) {
    return res.status(400).send("All fields are required.");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  // Read existing users
  const users = readUsers();

  // Check if user already exists
  if (users.some((user) => user.email === email)) {
    return res.status(400).send("User already exists.");
  }

  // Create new user with all required fields
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    grade,
    role: "user",
  };

  // Add new user to the array
  users.push(newUser);
  writeUsers(users);

  res.redirect("/login");
});

// POST route for login (Checkpoint #05)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  // Read existing users
  const users = readUsers();

  // Check if user exists and password matches
  const user = users.find(
    (user) => user.email === email && user.password === password,
  );
  if (!user) {
    return res.status(400).send("Invalid email or password.");
  }

  // Redirect to dashboard after successful login
  res.redirect("/dashboard");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
