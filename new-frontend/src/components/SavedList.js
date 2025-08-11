import React from 'react';

export default function SavedList({ saved = [] }) {
  if (!saved.length) return <div className="muted">No saved properties yet.</div>;
  return (
    <div className="grid">
      {saved.map(s => (
        <div className="property" key={s._id || s.propertyId}>
          <img src={s.image_url || s.imageUrl || 'https://via.placeholder.com/400x260'} alt={s.title} />
          <div className="property-body">
            <h4>{s.title}</h4>
            <div className="muted">{s.location}</div>
            <div>Saved on: {new Date(s.createdAt).toLocaleString()}</div>
            <div className="price">Predicted: {s.predictedPrice ? `$${Number(s.predictedPrice).toLocaleString()}` : '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
