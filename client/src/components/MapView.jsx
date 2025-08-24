import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Simple icon fix (Leaflet default icons don't load properly in many bundlers)
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ user }) {
  const [resources, setResources] = useState([]);
  const [region, setRegion] = useState('');
  const [error, setError] = useState(null);
  const [pendingRecommend, setPendingRecommend] = useState({});
  const [actionError, setActionError] = useState({});
  const navigate = useNavigate();

  const fetchResources = () => {
    const url = region ? `/api/resources?region=${encodeURIComponent(region)}` : '/api/resources';
    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(data => {
        setResources(data);
        setActionError({});
        setPendingRecommend({});
      })
      .catch(setError);
  };

  useEffect(() => {
    fetchResources();
  }, [region]);

  function handleRecommend(id) {
    setPendingRecommend(prev => ({ ...prev, [id]: true }));
    fetch(`/api/resources/${id}/recommend`, { method: 'POST', credentials: 'include' })
      .then(async r => {
        if (!r.ok) {
          if (r.status === 401) {
            setActionError(prev => ({ ...prev, [id]: 'Please log in to recommend' }));
            return Promise.reject('unauthorized');
          }
          if (r.status === 400) {
            const data = await r.json().catch(() => ({}));
            setActionError(prev => ({ ...prev, [id]: data.error || 'Bad request' }));
            return Promise.reject('bad request');
          }
          if (r.status === 404) {
            setActionError(prev => ({ ...prev, [id]: 'Resource not found' }));
            return Promise.reject('not found');
          }
          setActionError(prev => ({ ...prev, [id]: 'Error recommending resource' }));
          return Promise.reject('error');
        }
        const url = region ? `/api/resources?region=${encodeURIComponent(region)}` : '/api/resources';
        return fetch(url);
      })
      .then(r => (r.ok ? r.json() : Promise.reject('Failed to refresh')))
      .then(data => {
        setResources(data);
        setActionError(prev => ({ ...prev, [id]: null }));
      })
      .catch(console.error)
      .finally(() => setPendingRecommend(prev => ({ ...prev, [id]: false })));
  }

  

  const submitReview = async (resource_id, review) => {
    setError(null);
    setActionError(prev => ({ ...prev, [resource_id]: null }));
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_id, review }),
      credentials: 'include'
    });
    if (res.ok) {
      fetchResources();
    } else {
      let msg = 'Failed to submit review';
      try {
        const errorData = await res.json();
        if (errorData?.error) msg = errorData.error;
        if (errorData?.errors?.length) msg = errorData.errors[0].msg || msg;
      } catch {}
      if (res.status === 401) msg = 'Please log in to add a review';
      setActionError(prev => ({ ...prev, [resource_id]: msg }));
    }
  };

  function handleReview(e, id) {
    e.preventDefault();
    const content = e.target.review.value.trim();
    if (!content) return;
    submitReview(id, content);
    e.target.review.value = '';
  }

  return (
    <div className="card map-card">
      {error && <p className="error" style={{padding:'0.5rem'}}>{String(error)}</p>}
      <div className="toolbar" style={{padding:'0.75rem'}}>
        Region: <input value={region} onChange={e => setRegion(e.target.value)} />{' '}
        <button onClick={() => setRegion(region.trim())}>Search</button>{' '}
        {user ? (
          <button onClick={() => navigate('/add')}>Add Resource</button>
        ) : (
          <button disabled title="Log in to add a resource">Add Resource</button>
        )}
      </div>
      {user && <div className="login-status" style={{padding: '0 0.75rem 0.75rem'}}>Logged in as {user.username}</div>}
      <div className="main-content">
        <div className="map-panel">
          <MapContainer center={[51.505, -0.09]} zoom={5} style={{ height: '500px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              crossOrigin=""
            />
            {resources.map(r => (
              <Marker key={r.id} position={[r.lat, r.lon]}>
                <Popup>
                  <strong>{r.name}</strong>
                  <p>{r.description}</p>
                  <p>{r.region}, {r.country}</p>
                  <p>Recommendations: {r.recommendations}</p>
                  {user ? (
                    <button onClick={() => handleRecommend(r.id)} disabled={!!pendingRecommend[r.id]}>
                      {pendingRecommend[r.id] ? 'Recommending…' : 'Recommend'}
                    </button>
                  ) : (
                    <button disabled title="Log in to recommend">Recommend</button>
                  )}
                  {user ? (
                    <form onSubmit={e => handleReview(e, r.id)} style={{ marginTop: '0.5rem' }}>
                      <input name="review" placeholder="Write review" maxLength={500} />{' '}
                      <button type="submit">Add</button>
                    </form>
                  ) : (
                    <div style={{ marginTop: '0.5rem', color: '#666' }}>Log in to add a review</div>
                  )}
                  {actionError[r.id] && (
                    <div style={{ color: '#b00020', marginTop: '0.25rem' }}>{actionError[r.id]}</div>
                  )}
                    <ul style={{marginTop:'0.5rem', paddingLeft:'1rem'}}>
                      {r.reviews.map((rv, i) => (
                        <li key={rv.id || i}>{rv.review}</li>
                      ))}
                    </ul>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="results-panel">
          <div className="search-summary">
            <h2 style={{margin:"0 0 0.5rem 0"}}>Results for: <span>{region || 'all regions'}</span> ({resources.length} found)</h2>
          </div>
          {resources.length === 0 ? (
            <p>No resources found for this region.</p>
          ) : (
            resources.map(r => (
              <div key={r.id} className="resource-card" onClick={() => setRegion(r.region)}>
                <strong>{r.name}</strong> <span className="category">{r.category}</span>
                <p className="desc">{r.description}</p>
                <p>Recommendations: {r.recommendations}</p>
                {user ? (
                  <button className="recommend-btn" onClick={() => handleRecommend(r.id)} disabled={!!pendingRecommend[r.id]}>
                    {pendingRecommend[r.id] ? 'Recommending…' : 'Recommend'}
                  </button>
                ) : (
                  <button className="recommend-btn" disabled title="Log in to recommend">Recommend</button>
                )}
                {r.reviews && r.reviews.length > 0 && (
                  <ul className="reviews-list" style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {r.reviews.map((rv, i) => (
                      <li key={rv.id || i}>{rv.review}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
