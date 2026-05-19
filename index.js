const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Kalau pakai .env

const app = express();
app.use(cors());
app.use(express.json());

const routes = require('./serves');
app.use(routes);

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/smarttruck', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch((err) => console.error('MongoDB error:', err));
