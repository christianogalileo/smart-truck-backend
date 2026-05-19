const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');  // Pastikan db.js sudah benar koneksinya
const trackingRouter = require('./routes/tracking');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads folder
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
app.use('/uploads', express.static(uploadPath));

// Debug semua request masuk (opsional, untuk troubleshooting)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


// ------------------- REGISTER ROUTE -------------------
console.log("Register route aktif");
app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
  }

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error saat cek email:', checkErr);
      return res.status(500).json({ message: 'Gagal memeriksa email' });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [email, password, role], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error saat insert user:', insertErr);
        return res.status(500).json({ message: 'Gagal registrasi user' });
      }

      return res.status(201).json({ message: 'Registrasi berhasil', userId: insertResult.insertId });
    });
  });
});

// ------------------- LOGIN ROUTE -------------------
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?';
  db.query(sql, [email, password, role], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Gagal memproses login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email, password, atau role salah' });
    }

    // Kirim data user yang login (tanpa password)
    const user = {
      id: results[0].id,
      email: results[0].email,
      role: results[0].role
    };

    res.status(200).json({ message: 'Login berhasil', user });
  });
});


// ------------------- TRUCK ROUTES -------------------
app.get('/api/trucks', (req, res) => {
  const sql = "SELECT * FROM trucks";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error get trucks:', err);
      return res.status(500).json({ message: "Server error" });
    }

    const data = results.map(truck => ({
      ...truck,
      image_url: truck.image_path ? `/uploads/${truck.image_path}` : null
    }));

    res.json(data);
  });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  }),
});

app.put('/api/trucks/:truckId', upload.single('image'), (req, res) => {
  const truckId = req.params.truckId;
  const { truckType, driver, status, date } = req.body;
  const newImage = req.file ? req.file.filename : null;

  if (!truckType || !driver || !status || !date) {
    return res.status(400).json({ message: 'Field tidak lengkap' });
  }

  // Cek apakah truckId ada di DB
  const selectTruckQuery = "SELECT * FROM trucks WHERE truckId = ?";
  db.query(selectTruckQuery, [truckId], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error cek truckId:', selectErr);
      return res.status(500).json({ message: 'Gagal cek data truck di database' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Truck tidak ditemukan' });
    }

    const oldTruck = selectResults[0];
    let imageToUpdate = oldTruck.image_path;

    // Jika ada gambar baru, hapus gambar lama (optional)
    if (newImage) {
      if (oldTruck.image_path) {
        const oldImagePath = path.join(uploadPath, oldTruck.image_path);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Gagal hapus gambar lama:', err);
          });
        }
      }
      imageToUpdate = newImage;
    }

    // Query update
    const updateQuery = 
      `UPDATE trucks
      SET truckType = ?, driver = ?, status = ?, date = ?, image_path = ?
      WHERE truckId = ?`
    ;
    const updateValues = [truckType, driver, status, date, imageToUpdate, truckId];

    db.query(updateQuery, updateValues, (updateErr) => {
      if (updateErr) {
        console.error('Error update truck:', updateErr);
        return res.status(500).json({ message: 'Gagal update data truck' });
      }

      // Insert tracking baru
      const insertTracking = "INSERT INTO tracking_data (truck_id, status, location) VALUES (?, ?, ?)";
      const trackingValues = [truckId, status, 'Warehouse'];

      db.query(insertTracking, trackingValues, (trackingErr) => {
        if (trackingErr) {
          console.error('Error insert tracking:', trackingErr);
          return res.status(500).json({ message: 'Gagal simpan tracking data' });
        }

        res.status(200).json({ message: '✅ Truck berhasil diupdate & tracking ditambah' });
      });
    });
  });
});


// ------------------- TRUCK ROUTES -------------------
app.get('/api/trucks', (req, res) => {
  // ... existing code ...
});

// Tambahkan ini di sini
app.get('/api/trucks/:truckId', (req, res) => {
  const { truckId } = req.params;
  const sql = "SELECT * FROM trucks WHERE truckId = ?";
  db.query(sql, [truckId], (err, results) => {
    if (err) {
      console.error('Error ambil truck:', err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Truck tidak ditemukan" });
    }

    const truck = results[0];
    res.json({
      truckId: truck.truckId,
      truckType: truck.truckType,
      driver: truck.driver,
      status: truck.status,
      date: truck.date,
      image: truck.image_path,
    });
  });
});


app.post('/api/trucks', upload.single('image'), (req, res) => {
  // ... existing code ...
});

app.delete('/api/trucks/:truckId', (req, res) => {
  // ... existing code ...
});

app.post('/api/trucks', upload.single('image'), (req, res) => {
  const { truckId, truckType, driver, status, date } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!truckId || !truckType || !driver || !status || !date) {
    return res.status(400).json({ message: 'Field tidak lengkap' });
  }

  const checkTruck = "SELECT truckId FROM trucks WHERE truckId = ?";
  db.query(checkTruck, [truckId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error cek truckId:', checkErr);
      return res.status(500).json({ message: 'Gagal cek data truck di database' });
    }

    if (checkResults.length > 0) {
      const truckDbId = checkResults[0].truckId;

      const updateTruck = 
        `UPDATE trucks
        SET truckType = ?, driver = ?, status = ?, date = ?, image_path = ?
        WHERE truckId = ?`
      ;
      const updateValues = [truckType, driver, status, date, image, truckDbId];

      db.query(updateTruck, updateValues, (updateErr) => {
        if (updateErr) {
          console.error('Error update truck:', updateErr);
          return res.status(500).json({ message: 'Gagal update data truck' });
        }

        const insertTracking = "INSERT INTO tracking_data (truck_id, status, location) VALUES (?, ?, ?)";
        const trackingValues = [truckDbId, status, 'Warehouse'];

        db.query(insertTracking, trackingValues, (trackingErr) => {
          if (trackingErr) {
            console.error('Error insert tracking:', trackingErr);
            return res.status(500).json({ message: 'Gagal simpan tracking data' });
          }

          res.status(200).json({ message: '✅ Truck berhasil diupdate & tracking ditambah', id: truckDbId });
        });
      });

    } else {
      const insertTruck = 
        `INSERT INTO trucks (truckId, truckType, driver, status, date, image_path)
        VALUES (?, ?, ?, ?, ?, ?)`
      ;
      const insertValues = [truckId, truckType, driver, status, date, image];

      db.query(insertTruck, insertValues, (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error insert truck:', insertErr);
          return res.status(500).json({ message: 'Gagal simpan data truck' });
        }

        const newTruckDbId = insertResult.insertId;

        const insertTracking = "INSERT INTO tracking_data (truck_id, status, location) VALUES (?, ?, ?)";
        const trackingValues = [newTruckDbId, status, 'Warehouse'];

        db.query(insertTracking, trackingValues, (trackingErr) => {
          if (trackingErr) {
            console.error('Error insert tracking:', trackingErr);
            return res.status(500).json({ message: 'Gagal simpan tracking data' });
          }

          res.status(201).json({ message: '✅ Truck & Tracking berhasil disimpan', id: newTruckDbId });
        });
      });
    }
  });
});

app.delete('/api/trucks/:truckId', (req, res) => {
  const { truckId } = req.params;

  const deleteTruckQuery = 'DELETE FROM trucks WHERE truckId = ?';

  db.query(deleteTruckQuery, [truckId], (err, result) => {
    if (err) {
      console.error('❌ Gagal menghapus truck:', err);
      return res.status(500).json({ message: 'Gagal menghapus truck', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Truck tidak ditemukan' });
    }

    res.status(200).json({ message: 'Truck berhasil dihapus' });
  });
});

// ------------------- RFID ROUTES -------------------
app.get('/api/rfid/latest', (req, res) => {
  const getFirstRFID = "SELECT * FROM rfid_logs ORDER BY id ASC LIMIT 1";

  db.query(getFirstRFID, (err, results) => {
    if (err) {
      console.error('❌ Gagal mengambil data RFID:', err.message);
      return res.status(500).json({ message: 'Gagal mengambil data RFID dari database' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Belum ada data RFID yang tersimpan' });
    }

    const firstRow = results[0];
    const rfidCode = firstRow.rfid_code;

    const checkTruck = "SELECT * FROM trucks WHERE truckId = ?";
    db.query(checkTruck, [rfidCode], (truckErr, truckResults) => {
      if (truckErr) {
        console.error('❌ Gagal mengambil data truck:', truckErr.message);
        return res.status(500).json({ message: 'Gagal mengambil data truck dari database' });
      }

      const deleteRFID = "DELETE FROM rfid_logs WHERE id = ?";
      db.query(deleteRFID, [firstRow.id], (deleteErr) => {
        if (deleteErr) {
          console.error('❌ Gagal menghapus data RFID:', deleteErr.message);
          return res.status(500).json({ message: 'RFID diambil, tapi gagal menghapus dari database' });
        }

        if (truckResults.length === 0) {
          return res.status(200).json({
            id: firstRow.id,
            rfid: rfidCode,
            message: '✅ Data RFID ditemukan dan telah dihapus dari database'
          });
        } else {
          return res.status(200).json({
            message: '✅ Truck ditemukan berdasarkan RFID',
            truck: truckResults[0]
          });
        }
      });
    });
  });
});

app.post('/api/rfid/latest', (req, res) => {
  const { rfid } = req.body;

  if (!rfid || typeof rfid !== 'string' || rfid.trim() === '') {
    return res.status(400).json({ message: 'RFID tidak valid atau tidak ditemukan di request body' });
  }

  const clearTable = "DELETE FROM rfid_logs";

  db.query(clearTable, (clearErr) => {
    if (clearErr) {
      console.error('❌ Gagal menghapus data lama:', clearErr.message);
      return res.status(500).json({ message: 'Gagal menghapus data sebelumnya dari database' });
    }

    const insertRFID = "INSERT INTO rfid_logs (rfid_code) VALUES (?)";

    db.query(insertRFID, [rfid], (insertErr, result) => {
      if (insertErr) {
        console.error('❌ Gagal menyimpan RFID:', insertErr.message);
        return res.status(500).json({ message: 'Gagal menyimpan RFID ke database' });
      }

      return res.status(201).json({
        message: '✅ RFID berhasil disimpan setelah menghapus data lama',
        id: result.insertId
      });
    });
  });
});

// ------------------- TRACKING ROUTES -------------------
app.use('/api/tracking', trackingRouter);

// ------------------- START SERVER -------------------
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

app.put('/api/trucks/:truckId', (req, res) => {
  const { truckId } = req.params;
  const { truckType, driver, status, date } = req.body;
  const image = req.file ? req.file.filename : null; // kalau mau update gambar juga, perlu konfigurasi multer lagi

  if (!truckType || !driver || !status || !date) {
    return res.status(400).json({ message: 'Field tidak lengkap' });
  }

  // Update query tanpa gambar dulu (gambar update lebih kompleks jika lewat PUT)
  const sql = 
    `UPDATE trucks
    SET truckType = ?, driver = ?, status = ?, date = ?
    WHERE truckId = ?`
  ;

  db.query(sql, [truckType, driver, status, date, truckId], (err, result) => {
    if (err) {
      console.error('Error update truck:', err);
      return res.status(500).json({ message: 'Gagal update data truck' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Truck tidak ditemukan' });
    }

    res.status(200).json({ message: 'Truck berhasil diupdate' });
  });
});
