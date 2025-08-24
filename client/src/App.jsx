
import { useState, useEffect } from 'react';
import './App.css'

import { Routes, Route } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import MapView from './components/MapView.jsx';
import AddResource from './components/AddResource.jsx';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch('/api/users/me', { credentials: 'include', signal: ac.signal });
        if (r.status === 401 || r.status === 204) { setUser(null); return; }
        if (!r.ok) { setUser(null); return; }
        const data = await r.json().catch(() => null);
        setUser(data?.user ?? null);
      } catch {
        setUser(null);
      }
    })();
    return () => ac.abort();
  }, []);

  return (
    <>
      <AuthBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<MapView user={user} />} />
        <Route path="/add" element={<AddResource user={user} />} />
      </Routes>

    </>
  )
}

export default App
