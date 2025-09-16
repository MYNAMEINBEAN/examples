const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const express = require("express");
const axios = require("axios");
const app = express();

const zipPath = path.resolve(__dirname, "./load-custom-chrome-extension/extension.zip");
const vmConfig = {
  timeout: {
    offline: 300,
  },
  extension: {
    field: "ex",
  },
  ublock: true,
  start_url: "https://www.google.com",
};

let computer;

// Serve static files
app.use(express.static('.'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/computer", async (req, res) => {
  try {
    if (computer) {
      res.json(computer);
      return;
    }

    // Check if extension.zip exists
    if (!fs.existsSync(zipPath)) {
      return res.status(500).json({ 
        error: "Extension file not found. Please run 'npm install' first." 
      });
    }

    const formData = new FormData();
    formData.append("ex", fs.createReadStream(zipPath));
    formData.append("body", JSON.stringify(vmConfig));

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${process.env.HB_API_KEY}`;

    const resp = await axios.post(
      "https://engine.hyperbeam.com/v0/vm",
      formData,
      { headers }
    );
    
    computer = resp.data;
    console.log("Created new Hyperbeam session with extension");
    res.json(computer);
    
  } catch (error) {
    console.error("Error creating computer session:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to create browser session",
      details: error.response?.data || error.message
    });
  }
});

// Reset computer session endpoint
app.post("/reset", (req, res) => {
  computer = null;
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Hyperbeam Chrome Extension Demo running at http://localhost:${PORT}`);
  console.log("📦 Extension will be loaded automatically when you start a session");
});