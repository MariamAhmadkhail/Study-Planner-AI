// Fetch the logged-in user's ID from localStorage
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("You are not logged in. Redirecting to login page.");
  window.location.href = "/login";
}

// Fetch user data from users.json
fetch("/data/users.json")
  .then((response) => response.json())
  .then((users) => {
    // Find the logged-in user
    const user = users.find((u) => u.id === userId);

    if (user) {
      // Populate the form with user data
      document.getElementById("name").value = user.name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("grade").value = user.grade || "";
      document.getElementById("favoriteSubject").value =
        user.favoriteSubject || "";
      document.getElementById("weakestSubject").value =
        user.weakestSubject || "";
      document.getElementById("studyHours").value = user.studyHours || "";
      document.getElementById("learningStyle").value = user.learningStyle || "";
      document.getElementById("school").value = user.school || "";
      document.getElementById("goal").value = user.goal || "";
      document.getElementById("preferredStudyTime").value =
        user.preferredStudyTime || "";
    } else {
      alert("User not found. Please log in again.");
      window.location.href = "/login";
    }
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
    alert("Failed to load profile data.");
  });

// Handle form submission to update the profile
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(e.target);
  const updatedUser = {
    id: userId,
    name: formData.get("name"),
    email: formData.get("email"),
    grade: formData.get("grade"),
    favoriteSubject: formData.get("favoriteSubject"),
    weakestSubject: formData.get("weakestSubject"),
    studyHours: formData.get("studyHours"),
    learningStyle: formData.get("learningStyle"),
    school: formData.get("school"),
    goal: formData.get("goal"),
    preferredStudyTime: formData.get("preferredStudyTime"),
    role: localStorage.getItem("userRole") || "user",
    password: "", // Password is not updated here
  };

  // Send the updated user data to the server
  try {
    const response = await fetch("/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await response.json();

    if (data.success) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile. Please try again.");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile. Please try again.");
  }
});
