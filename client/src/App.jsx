
import './App.css'

import { Routes, Route } from 'react-router-dom';
import AuthBar from './components/AuthBar.jsx';
import MapView from './components/MapView.jsx';
import AddResource from './components/AddResource.jsx';

function App() {

  return (
    <>
      <AuthBar />
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/add" element={<AddResource />} />
      </Routes>

    </>
  )
}

export default App
