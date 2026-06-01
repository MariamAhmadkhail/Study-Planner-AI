const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.urlencoded({ extended: true }));
// Update static paths to point to the nested directories
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/data", express.static(path.join(__dirname, "data")));
app.use(express.json());

// Enable CORS for Replit
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Path to users.json and tasks.json (updated to use __dirname)
const usersFilePath = path.join(__dirname, "data", "users.json");
const tasksFilePath = path.join(__dirname, "data", "tasks.json");

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

// GET routes (updated to use __dirname)
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

  const userIndex = users.findIndex((u) => u.id === updatedUser.id);

  if (userIndex === -1) {
    return res.status(404).send("User not found.");
  }

  users[userIndex] = { ...users[userIndex], ...updatedUser };
  writeUsers(users);

  res.status(200).json({ success: true });
});

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

// --- CHECKPOINT #09: Task Editing Routes ---
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

// --- CHECKPOINT #10: Groq AI Planner Route ---
// POST route to generate a study plan using Groq AI
app.post("/generate-ai-plan", async (req, res) => {
  try {
    const { userId } = req.body;
    const users = readUsers();
    const tasks = readTasks();

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const userTasks = tasks.filter((t) => t.userId === userId);

    // Prepare data for AI prompt
    const tasksInfo = userTasks
      .map(
        (task) =>
          `- ${task.title} (Subject: ${task.subject}, Due: ${task.dueDate}, Difficulty: ${task.difficulty}, Time: ${task.estimatedTime} minutes)`,
      )
      .join("\n");

    const profileInfo = `
      Weakest Subject: ${user.weakestSubject || "None"}
      Favorite Subject: ${user.favoriteSubject || "None"}
      Study Hours per Day: ${user.studyHours || "1"} hour(s)
      Preferred Study Time: ${user.preferredStudyTime || "Morning"}
      Learning Style: ${user.learningStyle || "Visual"}
      Goal: ${user.goal || "Improve grades"}
    `;

    // AI Prompt for Groq
    const prompt = `
      Create a detailed 7-day study plan for this student. Use the following information:

      **Student Profile:**
      ${profileInfo}

      **Current Tasks:**
      ${tasksInfo || "No tasks assigned."}

      **Requirements:**
      - Prioritize tasks with closer due dates.
      - Allocate more time to difficult tasks and the student's weakest subject.
      - Distribute tasks evenly across the week.
      - Include breaks and realistic study sessions based on the student's preferred study time.
      - Format the response as a JSON object with the following structure:
        {
          "focusAreas": ["List of 1-3 focus subjects for the week"],
          "dailyPlans": [
            {
              "day": "Monday",
              "totalStudyTime": "X minutes",
              "tasks": [
                {
                  "time": "HH:MM AM/PM",
                  "task": "Task title (Subject)",
                  "duration": "X minutes",
                  "notes": "Additional tips or focus areas"
                }
              ]
            }
          ],
          "tips": ["List of 2-3 personalized study tips"]
        }
    `;

    // Use Groq API
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message:
          "Groq API key not configured. Please set GROQ_API_KEY in .env file.",
      });
    }

    const response = await fetch("https://api.groq.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Groq API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    // Extract JSON from the response
    let plan;
    try {
      plan = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback plan if AI response is invalid
        plan = {
          focusAreas: [user.weakestSubject || "All Subjects"],
          dailyPlans: [
            {
              day: "Monday",
              totalStudyTime: `${userTasks.reduce((sum, task) => sum + parseInt(task.estimatedTime), 0)} minutes`,
              tasks: userTasks.map((task) => ({
                time: user.preferredStudyTime || "4:00 PM",
                task: `${task.title} (${task.subject})`,
                duration: `${task.estimatedTime} minutes`,
                notes: `Focus on ${task.difficulty.toLowerCase()} difficulty task.`,
              })),
            },
          ],
          tips: [
            `Prioritize your weakest subject: ${user.weakestSubject || "all subjects"}.`,
            `Study during your preferred time: ${user.preferredStudyTime || "morning"}.`,
            "Take regular breaks to stay focused.",
          ],
        };
      }
    }

    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error("Error generating AI plan with Groq:", error);
    res.status(500).json({
      success: false,
      message: `Failed to generate AI plan. Error: ${error.message}`,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
