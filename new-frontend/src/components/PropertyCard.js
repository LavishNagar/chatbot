import React from 'react';

export default function PropertyCard({ property, onSave, onPredict }) {
  const img = property.image_url || property.imageUrl || property.images?.[0] || 'https://via.placeholder.com/400x260';
  return (
    <div className="property">
      <img src={img} alt={property.title} />
      <div className="property-body">
        <h4>{property.title}</h4>
        <div className="muted">{property.location}</div>
        <div className="price">💰 ${property.price?.toLocaleString()}</div>
        <div className="meta">{property.bedrooms} 🛏 | {property.bathrooms} 🛁 • {property.size || ''}</div>
        <div className="property-actions">
          <button onClick={onSave}>Save</button>
          <button onClick={onPredict}>Save & Predict</button>
        </div>
      </div>
    </div>
  );
}
