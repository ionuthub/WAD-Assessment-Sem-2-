import db from '../db/db.js';

export function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function createUser(username, hashedPassword) {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const info = stmt.run(username, hashedPassword);
  return { id: info.lastInsertRowid, username };
}
