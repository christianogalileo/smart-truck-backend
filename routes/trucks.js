const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

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

// Middleware
router.use(express.json());

// Tambah truck baru
router.post('/', upload.single('image'), (req, res) => {
  const { truckId, truckType, driver, status, date } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!truckId || !truckType || !driver || !status || !date) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  const sql = 'INSERT INTO trucks (truckId, truckType, driver, status, date, image_path) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [truckId, truckType, driver, status, date, image];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Gagal menyimpan data:', err);
      return res.status(500).json({ message: 'Gagal menyimpan data truck', error: err });
    }

    const imageUrl = image ? `/api/uploads/${image}` : null;

    res.status(201).json({
      message: 'Truck berhasil ditambahkan',
      data: { truckId, truckType, driver, status, date, image_path: image, image_url: imageUrl },
    });
  });
});

// Ambil semua truck
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM trucks';
 
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Gagal mengambil data:', err);
      return res.status(500).json({ message: 'Gagal mengambil data truck', error: err });
    }

    const trucks = results.map(truck => {
      let imageUrl = null;
      if (truck.image_path) {
        imageUrl = `/api/uploads/${truck.image_path.replace(/^uploads[\\/]+/, '')}`;
      }
      return { ...truck, image_url: imageUrl };
    });

    res.status(200).json(trucks);
  });
});

// Hapus truck berdasarkan truckId
router.delete('/:truckId', (req, res) => {
  const { truckId } = req.params;

  const sql = 'DELETE FROM trucks WHERE truckId = ?';

  db.query(sql, [truckId], (err, result) => {
    if (err) {
      console.error('❌ Gagal menghapus data:', err);
      return res.status(500).json({ message: 'Gagal menghapus truck', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Truck tidak ditemukan' });
    }

    res.status(200).json({ message: 'Truck berhasil dihapus' });
  });
});

module.exports = router;
