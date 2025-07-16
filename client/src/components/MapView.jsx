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

export default function MapView() {
  const [resources, setResources] = useState([]);
  const [region, setRegion] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [reviewsById, setReviewsById] = useState({});

  useEffect(() => {
    const url = region ? `/api/resources?region=${encodeURIComponent(region)}` : '/api/resources';
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setResources)
      .catch(setError);
  }, [region]);

  // fetch reviews for all resources whenever the list updates
  useEffect(() => {
    if (resources.length === 0) return;
    Promise.all(
      resources.map(r =>
        fetch(`/api/reviews/${r.id}`)
          .then(res => (res.ok ? res.json() : []))
          .then(data => ({ id: r.id, reviews: data }))
          .catch(() => ({ id: r.id, reviews: [] }))
      )
    ).then(all => {
      const map = {};
      all.forEach(({ id, reviews }) => {
        map[id] = reviews;
      });
      setReviewsById(prev => ({ ...prev, ...map }));
    });
  }, [resources]);

  function handleRecommend(id) {
    fetch(`/api/resources/${id}/recommend`, { method: 'POST' })
      .then(r => {
        if (!r.ok) throw new Error('Error recommending');
        const url = region ? `/api/resources?region=${encodeURIComponent(region)}` : '/api/resources';
        return fetch(url);
      })
      .then(r => (r.ok ? r.json() : Promise.reject('Failed to refresh')))
      .then(setResources)
      .catch(console.error);
  }

  function loadReviews(id) {
    fetch(`/api/reviews/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject('Error fetching reviews')))
      .then(data => setReviewsById(prev => ({ ...prev, [id]: data })))
      .catch(console.error);
  }

  function handleReview(e, id) {
    e.preventDefault();
    const content = e.target.review.value.trim();
    if (!content) return;
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId: id, content })
    }).then(r => {
      if (!r.ok) throw new Error('Server error');
      e.target.review.value = '';
      // update UI immediately
      setReviewsById(prev => ({
        ...prev,
        [id]: [{ id: Date.now(), review: content }, ...(prev[id] || [])]
      }));
      alert('Review added');
    }).catch(err => alert(err.message));
  }

  return (
    <div className="card map-card">
      {error && <p className="error" style={{padding:'0.5rem'}}>{String(error)}</p>}
      <div className="toolbar" style={{padding:'0.75rem'}}>
        Region: <input value={region} onChange={e => setRegion(e.target.value)} />{' '}
        <button onClick={() => setRegion(region.trim())}>Search</button>{' '}
        <button onClick={() => navigate('/add')}>Add Resource</button>
      </div>
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
                <Popup onOpen={() => loadReviews(r.id)}>
                  <strong>{r.name}</strong>
                  <p>{r.description}</p>
                  <p>{r.region}, {r.country}</p>
                  <p>Recommendations: {r.recommendations}</p>
                  <button onClick={() => handleRecommend(r.id)}>Recommend</button>
                  <form onSubmit={e => handleReview(e, r.id)} style={{ marginTop: '0.5rem' }}>
                    <input name="review" placeholder="Write review" />{' '}
                    <button type="submit">Add</button>
                  </form>
                    <ul style={{marginTop:'0.5rem', paddingLeft:'1rem'}}>
                      {(reviewsById[r.id] || []).map((rv, i) => (
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
                <p className="recommends">Recommendations: {r.recommendations}</p>
                <button className="recommend-btn" onClick={() => handleRecommend(r.id)}>Recommend</button>
                {reviewsById[r.id] && reviewsById[r.id].length > 0 && (
                  <ul className="reviews-list" style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {reviewsById[r.id].map((rv, i) => (
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
