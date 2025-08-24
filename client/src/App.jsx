
import { useState, useEffect } from 'react';
import './App.css'

import { Routes, Route } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import MapView from './components/MapView.jsx';
import AddResource from './components/AddResource.jsx';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(async r => {
        if (r.status === 401 || r.status === 204) {
          setUser(null);
          return null;
        }
        const data = await r.json().catch(() => null);
        if (data && data.user) setUser(data.user);
        return null;
      })
      .catch(() => setUser(null));
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
