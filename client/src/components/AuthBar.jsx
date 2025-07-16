import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthBar() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [signup, setSignup] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => (r.status === 204 ? null : r.json()))
      .then(data => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async path => {
    setMsg('');
    const res = await fetch(`/api/users/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setForm({ username: '', password: '' });
      setSignup(false);
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg(err.error || 'Error');
    }
  };

  const logout = async () => {
    await fetch('/api/users/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">DiscoverHealth</Link>

      {user ? (
        <div className="nav-actions">
          <span className="user">Logged in as {user.username}</span>
          <span>|</span>
          <Link to="/">Home</Link>
          <span>|</span>
          <Link to="/add">Add Resource</Link>
          <span>|</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="nav-actions">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button onClick={() => submit('login')}>Login</button>
          <button onClick={() => setSignup(!signup)}>Sign up</button>
          {signup && <button onClick={() => submit('signup')}>Confirm signup</button>}
          <span style={{ color: 'red' }}>{msg}</span>
        </div>
      )}
    </header>
  );
}
