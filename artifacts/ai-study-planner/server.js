const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));
app.use("/data", express.static("data"));
app.use(express.json()); // Parse JSON requests

// Enable CORS for Replit
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Path to users.json
const usersFilePath = path.join(__dirname, "data", "users.json");

// Helper function to read users from JSON file
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to write users to JSON file
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// GET routes
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

// POST route for registration
app.post("/register", (req, res) => {
  const { name, email, password, confirmPassword, grade } = req.body;

  if (!name || !email || !password || !confirmPassword || !grade) {
    return res.status(400).send("All fields are required.");
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    return res.status(400).send("User already exists.");
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    grade,
    role: "user",
    favoriteSubject: "",
    weakestSubject: "",
    studyHours: "",
    learningStyle: "",
    school: "",
    goal: "",
    preferredStudyTime: "",
  };

  users.push(newUser);
  writeUsers(users);

  res.redirect("/login");
});

// POST route for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const users = readUsers();
  const user = users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    return res.status(400).send("Invalid email or password.");
  }

  res.redirect("/dashboard");
});

// POST route to update user profile
app.post("/update-profile", (req, res) => {
  const updatedUser = req.body;
  const users = readUsers();

  // Find the index of the user to update
  const userIndex = users.findIndex((u) => u.id === updatedUser.id);

  if (userIndex === -1) {
    return res.status(404).send("User not found.");
  }

  // Update the user data
  users[userIndex] = { ...users[userIndex], ...updatedUser };

  // Save the updated users back to users.json
  writeUsers(users);

  res.status(200).json({ success: true });
});

// Path to tasks.json
const tasksFilePath = path.join(__dirname, "data", "tasks.json");

// Helper function to read tasks from JSON file
function readTasks() {
  try {
    const data = fs.readFileSync(tasksFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to write tasks to JSON file
function writeTasks(tasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// GET route to fetch all tasks
app.get("/get-tasks", (req, res) => {
  const tasks = readTasks();
  res.status(200).json(tasks);
});

// POST route to create a new task
app.post("/create-task", (req, res) => {
  const newTask = req.body;
  const tasks = readTasks();

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(200).json({ success: true });
});

// --- CHECKPOINT #09: NEW ROUTES ---
// POST route to update a task
app.post("/update-task", (req, res) => {
  const updatedTask = req.body;
  const tasks = readTasks();

  const taskIndex = tasks.findIndex((t) => t.id === updatedTask.id);

  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }

  tasks[taskIndex] = updatedTask;
  writeTasks(tasks);

  res.status(200).json({ success: true });
});

// POST route to delete a task
app.post("/delete-task", (req, res) => {
  const { taskId } = req.body;
  const tasks = readTasks();

  const updatedTasks = tasks.filter((t) => t.id !== taskId);
  writeTasks(updatedTasks);

  res.status(200).json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
