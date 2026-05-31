// Check if the user is logged in
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("You are not logged in. Redirecting to login page.");
  window.location.href = "/login";
}

// Handle form submission to create a new task
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(e.target);
  const newTask = {
    id: `task-${Date.now()}`,
    userId: userId,
    subject: formData.get("subject"),
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    difficulty: formData.get("difficulty"),
    estimatedTime: formData.get("estimatedTime"),
    status: "Pending", // Default status
  };

  // Send the new task data to the server
  try {
    const response = await fetch("/create-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    const data = await response.json();

    if (data.success) {
      alert("Task created successfully!");
      e.target.reset(); // Clear the form
    } else {
      alert("Failed to create task. Please try again.");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    alert("Failed to create task. Please try again.");
  }
});
