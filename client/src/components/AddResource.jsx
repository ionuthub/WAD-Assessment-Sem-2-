import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

export default function AddResource() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    region: '',
    country: '',
    lat: 51.505,
    lon: -0.09
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onMapClick(e) {
    setForm({ ...form, lat: e.latlng.lat, lon: e.latlng.lng });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }
      setSuccess('✔ Resource added successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(`✖ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <h2>Add Healthcare Resource</h2>
      {error && <div style={{ background: '#ffe6e6', color: '#c00', padding: '0.5rem', marginBottom: '0.5rem' }}>{error}</div>}
      {success && <div style={{ background: '#e6ffea', color: '#007a1f', padding: '0.5rem', marginBottom: '0.5rem' }}>{success}</div>}
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 500, margin: 'auto' }}>
        <label>Name<br />
          <input name="name" value={form.name} onChange={updateField} required />
        </label><br />
        <label>Description<br />
          <textarea name="description" value={form.description} onChange={updateField} required />
        </label><br />
        <label>Category<br />
          <select name="category" value={form.category} onChange={updateField} required>
            <option value="">Select category</option>
            <option value="Clinic">Clinic</option>
            <option value="Dentist">Dentist</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Support Group">Support Group</option>
            <option value="Hospital">Hospital</option>
            <option value="Wellness Center">Wellness Center</option>
          </select>
        </label><br />
        <label>Region<br />
          <input name="region" value={form.region} onChange={updateField} />
        </label><br />
        <label>Country<br />
          <input name="country" value={form.country} onChange={updateField} />
        </label><br />
        <p>Pick location (click map): lat {form.lat.toFixed(4)}, lon {form.lon.toFixed(4)}</p>
        <button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Resource'}</button>
      </form>
      <div id="map" style={{ height: '300px', margin: '1rem auto', width: '90%', maxWidth: '600px' }}>
        <MapContainer center={[form.lat, form.lon]} zoom={5} style={{ height: '100%', width: '100%' }} onclick={onMapClick}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[form.lat, form.lon]} draggable={true} eventHandlers={{ dragend: (e) => {
            const latlng = e.target.getLatLng();
            setForm({ ...form, lat: latlng.lat, lon: latlng.lng });
          } }} />
        </MapContainer>
      </div>
    </div>
  );
}
