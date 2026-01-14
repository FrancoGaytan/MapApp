const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load initial data into memory
const FIELDS_FILE = path.join(__dirname, 'data', 'fields.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

let fieldsMemory = [];
let usersMemory = [];

try {
  if (fs.existsSync(FIELDS_FILE)) {
    const rawData = fs.readFileSync(FIELDS_FILE, 'utf8');
    fieldsMemory = JSON.parse(rawData);
    console.log(`Loaded ${fieldsMemory.length} fields from ${FIELDS_FILE}`);
  }
} catch (e) {
  console.error('Error loading fields:', e);
}

try {
  if (fs.existsSync(USERS_FILE)) {
    usersMemory = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Error loading users:', e);
}

app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  version: '1.0.1',
  runtime: process.env.VERCEL ? 'vercel' : 'local',
  fieldsCount: fieldsMemory.length 
}));

app.get('/fields', (req, res) => {
  res.json(fieldsMemory);
});

app.post('/fields', (req, res) => {
  const newField = req.body;
  if (!newField || !newField.id) {
    return res.status(400).json({ error: 'Invalid field data' });
  }
  
  fieldsMemory.push(newField);
  
  // Only attempt disk write locally
  if (!process.env.VERCEL) {
    try {
      fs.writeFileSync(FIELDS_FILE, JSON.stringify(fieldsMemory, null, 2));
    } catch (e) {
      console.error('Write error:', e);
    }
  }
  
  res.status(201).json(newField);
});

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Campos requeridos' });
  }
  
  if (usersMemory.find(u => u.email === email)) {
    return res.status(400).json({ message: 'El email ya registrado' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: crypto.createHash('sha256').update(password).digest('hex'),
    createdAt: new Date().toISOString()
  };

  usersMemory.push(newUser);

  if (!process.env.VERCEL) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(usersMemory, null, 2));
    } catch (e) {}
  }

  res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token: crypto.randomBytes(32).toString('hex')
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const user = usersMemory.find(u => u.email === email && u.password === hash);
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: crypto.randomBytes(32).toString('hex')
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('API running on port ' + PORT);
  });
}

module.exports = app;
