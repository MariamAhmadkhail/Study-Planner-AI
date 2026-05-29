const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 19847;

// Serve static files from the "public" folder
app.use(express.static("public"));

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
