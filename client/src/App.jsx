
import { useState, useEffect } from 'react';
import './App.css'

import { Routes, Route } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import MapView from './components/MapView.jsx';
import AddResource from './components/AddResource.jsx';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => (r.status === 204 ? null : r.json()))
      .then(data => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {});
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
