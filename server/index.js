const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'fields.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeData(arr) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2), 'utf8');
}

// GET all fields
app.get('/fields', (req, res) => {
  const data = readData();
  // simulate latency
  setTimeout(() => res.json(data), 300);
});

// POST add new field
app.post('/fields', (req, res) => {
  const newField = req.body;
  if (!newField || !newField.id) {
    return res.status(400).json({ error: 'Invalid field data' });
  }

  const data = readData();
  data.push(newField);
  writeData(data);

  // simulate latency
  setTimeout(() => res.status(201).json(newField), 300);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
