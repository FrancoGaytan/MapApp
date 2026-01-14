const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS properly
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

const DATA_PATH = path.join(__dirname, 'data', 'fields.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8').trim();
    if (!raw) return [];
    
    // Attempt to fix common accidental truncation during write
    let sanitized = raw;
    if (sanitized.endsWith('}') && !sanitized.endsWith('}]')) {
       sanitized += ']';
    }
    
    return JSON.parse(sanitized);
  } catch (e) {
    console.error('Error reading data:', e);
    return [];
  }
}

function writeData(arr) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(arr), 'utf8');
  } catch (e) {
    console.error('Error writing data:', e);
  }
}

function readUsers() {
  try {
    if (!fs.existsSync(USERS_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(USERS_PATH, 'utf8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users:', e);
    return [];
  }
}

function writeUsers(users) {
  try {
    const dir = path.dirname(USERS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_PATH, JSON.stringify(users), 'utf8');
  } catch (e) {
    console.error('Error writing users:', e);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Auth routes
app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  const users = readUsers();
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  const token = generateToken();
  const userResponse = { id: newUser.id, name: newUser.name, email: newUser.email };
  
  res.status(201).json({ user: userResponse, token });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === hashPassword(password));
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const token = generateToken();
  const userResponse = { id: user.id, name: user.name, email: user.email };
  
  res.json({ user: userResponse, token });
});

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

// When deployed to serverless platforms (like Vercel) we export the
// express `app` instead of calling `listen`. For local development
// we still start the server normally.
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on http://0.0.0.0:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
  });
} else {
  // Export the app handler for Vercel's Node builder which can
  // invoke the Express app directly as a request handler.
  module.exports = app;
}
