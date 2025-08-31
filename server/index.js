const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const configPath = path.join(__dirname, "appConfig.json");
const dataPath = path.join(__dirname, "user_data.jsonl");

// Session tracking
const sessions = new Map();

// 🔹 POST: Log route choices
app.post("/api/log-choice", (req, res) => {
  const { sessionId, scenarioIndex, choice, tts, defaultTime } = req.body;

  if (
    typeof scenarioIndex !== "number" ||
    typeof choice !== "string" ||
    typeof tts !== "number" ||
    typeof defaultTime !== "number"
  ) {
    return res.status(400).json({ error: "Invalid request format" });
  }

  const isChosen = choice === "default" ? 0 : 1;
  const encoded = `${tts}-${isChosen}`;

  // Read numberOfScenarios from config file
  let totalScenarios = 0;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    totalScenarios = config.numberOfScenarios || totalScenarios;
  } catch (err) {
    console.warn("Could not read numberOfScenarios from config. Using fallback.");
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      timestamp: new Date().toISOString(),
      defaultTime,
      totalScenarios,
      choices: Array(totalScenarios).fill(undefined),
    });
  }

  const session = sessions.get(sessionId);
  session.choices[scenarioIndex] = encoded;

  res.json({ success: true });
});

// 🔹 POST: Log survey + finalize session
app.post("/api/log-survey", (req, res) => {
  const { sessionId, responses } = req.body;

  if (typeof sessionId !== "string" || typeof responses !== "object") {
    return res.status(400).json({ error: "Invalid request format" });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(400).json({ error: "Session not found" });
}

  session.responses = responses;

  try {
    fs.appendFileSync(dataPath, JSON.stringify(session) + "\n", "utf8");
    sessions.delete(sessionId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing user data:", err);
    res.status(500).json({ success: false });
  }
});

// 🔹 GET: Full app config
app.get("/api/route-endpoints", (req, res) => {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading appConfig.json:", err);
      return res.status(500).json({ error: "Failed to read config file" });
    }

    try {
      const config = JSON.parse(data);
      res.json(config);
    } catch (e) {
      console.error("Invalid JSON in appConfig.json");
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

// 🔹 POST: Save new config
app.post("/api/route-endpoints", (req, res) => {
  const incoming = req.body;

  if (
    !Array.isArray(incoming.start) ||
    !Array.isArray(incoming.end) ||
    typeof incoming.routes !== "object"
  ) {
    return res.status(400).json({ error: "Invalid config structure" });
  }

  fs.readFile(configPath, "utf8", (readErr, data) => {
    if (readErr && readErr.code !== "ENOENT") {
      console.error("Error reading existing config:", readErr);
      return res.status(500).json({ error: "Failed to read existing config" });
    }

    let existing = {};
    if (!readErr) {
      try {
        existing = JSON.parse(data);
      } catch (e) {
        console.error("Invalid JSON in existing config:", e);
      }
    }

    const merged = { ...existing, ...incoming };

    fs.writeFile(configPath, JSON.stringify(merged, null, 2), (err) => {
      if (err) {
        console.error("Error writing appConfig.json:", err);
        return res.status(500).json({ error: "Failed to write config file" });
      }

      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
