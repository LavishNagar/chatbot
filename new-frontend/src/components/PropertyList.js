import React from 'react';
import PropertyCard from './PropertyCard';

export default function PropertyList({ properties = [], onSave, onPredict }) {
  if (!properties.length) return <div className="muted">No results — try changing filters.</div>;
  return (
    <div className="grid">
      {properties.map(p => (
        <PropertyCard key={p.id} property={p} onSave={() => onSave && onSave(p)} onPredict={() => onPredict && onPredict(p)} />
      ))}
    </div>
  );
}
