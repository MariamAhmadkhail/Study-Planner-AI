document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You are not logged in. Redirecting to login page.");
    window.location.href = "/login";
    return;
  }

  const generateBtn = document.getElementById("generate-btn");
  const loadingDiv = document.getElementById("loading");
  const planContainer = document.getElementById("plan-container");

  // Generate and display the AI study plan
  async function generateAIPlan() {
    try {
      // Show loading spinner
      loadingDiv.style.display = "block";
      planContainer.style.display = "none";
      generateBtn.disabled = true;

      const response = await fetch("/generate-ai-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to generate AI plan.");
      }

      const plan = data.plan;

      // Hide loading spinner
      loadingDiv.style.display = "none";
      planContainer.style.display = "block";
      generateBtn.disabled = false;

      // Display focus areas
      const focusAreasDiv = document.getElementById("focus-areas");
      if (plan.focusAreas && plan.focusAreas.length > 0) {
        focusAreasDiv.innerHTML = `
          <h3>🎯 Focus Areas This Week:</h3>
          <ul>
            ${plan.focusAreas.map((area) => `<li>${area}</li>`).join("")}
          </ul>
        `;
      } else {
        focusAreasDiv.innerHTML = "<p>No specific focus areas identified.</p>";
      }

      // Display daily plans
      const dailyPlansDiv = document.getElementById("daily-plans");
      if (plan.dailyPlans && plan.dailyPlans.length > 0) {
        dailyPlansDiv.innerHTML = `
          <h3>📅 Your 7-Day Study Plan:</h3>
          ${plan.dailyPlans
            .map(
              (dayPlan) => `
            <div class="plan-day">
              <h3>${dayPlan.day}</h3>
              <p><strong>Total Study Time:</strong> ${dayPlan.totalStudyTime}</p>
              <div class="tasks">
                ${dayPlan.tasks
                  .map(
                    (task) => `
                  <div class="task-item">
                    <p><strong>${task.time}:</strong> ${task.task}</p>
                    <p><small>Duration: ${task.duration} | ${task.notes || ""}</small></p>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
        `;
      } else {
        dailyPlansDiv.innerHTML =
          "<p>No study plan generated. Try adding tasks first!</p>";
      }

      // Display tips
      const tipsDiv = document.getElementById("tips");
      if (plan.tips && plan.tips.length > 0) {
        tipsDiv.innerHTML = `
          <h3>💡 Personalized Tips:</h3>
          <ul>
            ${plan.tips.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        `;
      } else {
        tipsDiv.innerHTML = "";
      }
    } catch (error) {
      console.error("Error generating AI plan:", error);
      loadingDiv.style.display = "none";
      planContainer.style.display = "block";
      generateBtn.disabled = false;
      alert(
        `Failed to generate AI plan. Error: ${error.message}. Please try again.`,
      );
    }
  }

  // Load plan on page load
  generateAIPlan();

  // Regenerate plan on button click
  generateBtn.addEventListener("click", generateAIPlan);
});
