// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Koneksi MySQL
const bcrypt = require('bcrypt');

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
  }

  // Cek apakah user sudah ada
  const checkUser = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUser, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const insertUser = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertUser, [email, hashedPassword, role], (insertErr, insertResult) => {
      if (insertErr) return res.status(500).json({ message: 'Gagal daftar user' });

      res.status(201).json({ message: 'User berhasil didaftarkan' });
    });
  });
});

module.exports = router;
