const express = require('express');
const router = express.Router();
const db = require('../db'); // Import koneksi DB dari db.js
const multer = require('multer');
const path = require('path');

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/**
 * GET semua data tracking
 * Bisa difilter dengan truck_id atau status
 */
router.get('/', (req, res) => {
  const { truck_id, status } = req.query;

  let query = `
    SELECT tracking_data.*, trucks.image_path 
    FROM tracking_data 
    LEFT JOIN trucks ON tracking_data.truck_id = trucks.truckId
  `;
  const params = [];

  if (truck_id && status) {
    query += ' WHERE tracking_data.truck_id = ? AND tracking_data.status = ?';
    params.push(truck_id, status);
  } else if (truck_id) {
    query += ' WHERE tracking_data.truck_id = ?';
    params.push(truck_id);
  } else if (status) {
    query += ' WHERE tracking_data.status = ?';
    params.push(status);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    const data = results.map(item => ({
      ...item,
      image_url: item.image_path ? `/api/uploads/${item.image_path}` : null,
    }));

    res.json(data);
  });
});

/**
 * POST data tracking baru (tidak ada upload gambar di sini)
 */
router.post('/', (req, res) => {
  const { truck_id, status, location } = req.body;

  if (!truck_id || !status || !location) {
    return res.status(400).json({ message: 'truck_id, status, and location are required.' });
  }

  const query = 'INSERT INTO tracking_data (truck_id, status, location) VALUES (?, ?, ?)';
  db.query(query, [truck_id, status, location], (err, result) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(201).json({
      id: result.insertId,
      truck_id,
      status,
      location,
      message: 'Tracking data saved successfully.',
    });
  });
});

module.exports = router;
