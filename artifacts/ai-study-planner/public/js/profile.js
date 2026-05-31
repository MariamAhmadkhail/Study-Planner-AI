// profile.js - Profile logic
// Fetch the logged-in user's ID from localStorage
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("You are not logged in. Redirecting to login page.");
  window.location.href = "/login";
} else {
  // Fetch user data from users.json
  fetch("/data/users.json")
    .then((response) => response.json())
    .then((users) => {
      // Find the logged-in user
      const user = users.find((u) => u.id === userId);

      if (user) {
        // Display user data on the page
        const profileDataDiv = document.getElementById("profile-data");
        profileDataDiv.innerHTML = `
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Grade Level:</strong> ${user.grade}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Favorite Subject:</strong> ${user.favoriteSubject || "Not set"}</p>
          <p><strong>Weakest Subject:</strong> ${user.weakestSubject || "Not set"}</p>
          <p><strong>Study Hours per Day:</strong> ${user.studyHours || "Not set"}</p>
          <p><strong>Learning Style:</strong> ${user.learningStyle || "Not set"}</p>
          <p><strong>School:</strong> ${user.school || "Not set"}</p>
          <p><strong>Academic Goal:</strong> ${user.goal || "Not set"}</p>
          <p><strong>Preferred Study Time:</strong> ${user.preferredStudyTime || "Not set"}</p>
        `;
      } else {
        alert("User not found. Please log in again.");
        window.location.href = "/login";
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      alert("Failed to load profile data.");
    });
}
