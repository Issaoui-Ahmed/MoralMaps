const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Ensure CSV file exists
const csvPath = path.join(__dirname, "choices.csv");
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, "timestamp,choice\n", "utf8");
}

app.post("/api/log-choice", (req, res) => {
  const { choice } = req.body;
  const timestamp = new Date().toISOString();
  const row = `${timestamp},${choice}\n`;

  fs.appendFile(csvPath, row, (err) => {
    if (err) {
      console.error("Error writing to CSV:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
