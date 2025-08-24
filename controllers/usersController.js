import bcrypt from 'bcryptjs';
import * as usersDao from '../daos/usersDao.js';

export function signup(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const user = usersDao.createUser(username, hashed);
    // Store only minimal session data
    req.session.user = { id: user.id, username: user.username };
    // Respond without sensitive fields
    res.json({ message: 'Signed up', user: req.session.user });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username taken' });
    }
    next(err);
  }
}

export function login(req, res, next) {
  const { username, password } = req.body;
  const userRecord = usersDao.getUserByUsername(username);
  if (!userRecord) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, userRecord.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { id: userRecord.id, username: userRecord.username };
  res.json({ message: 'Logged in', user: req.session.user });
}

export function logout(req, res) {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
}

export function me(req, res) {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    // Return 401 so clients can clear stale user state
    res.status(401).json({ error: 'Not authenticated' });
  }
}

