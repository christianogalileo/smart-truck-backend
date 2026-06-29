const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function hashAllPasswords() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sesuaikan
    database: 'smart_truck_db'
  });

  const [users] = await db.execute('SELECT id, password FROM users');
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    console.log(`Password user ${user.id} di-hash`);
  }

  console.log('✅ Semua password sudah di-hash');
  await db.end();
}

hashAllPasswords();
