import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import { AuthContext } from '../auth/AuthProvider';
import useDebounce from '../hooks/useDebounce';
import PropertyList from '../components/PropertyList';

import SavedList from '../components/SavedList';

export default function ChatbotPage() {
  const { user, token } = useContext(AuthContext);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState([]);

  // Debounced search
  const doSearch = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/properties/search`, payload);
      setResults(res.data || []);
    } catch (err) {
      console.error('Search error', err);
    }
  };
  const debouncedSearch = useDebounce(doSearch, 350);

  // call on input change
  useEffect(() => {
    const payload = {
      location: location || undefined,
      budget: budget ? Number(budget) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      q: q || undefined
    };
    debouncedSearch(payload);
  }, [location, budget, bedrooms, q]); // eslint-disable-line

  // load saved when user logs in
  useEffect(() => {
    if (!user || !token) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/properties/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(res.data || []);
      } catch (err) {
        console.error('Load saved error', err);
      }
    })();
  }, [user, token]);

  // Save property (no prediction)
  const handleSave = async (property) => {
    if (!token) return alert('Please login to save properties');
    try {
      const res = await axios.post(`${API_BASE}/properties/save`, property, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(prev => [res.data.saved, ...prev]);
      alert('Saved!');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  // Save & predict
  const handlePredictSave = async (property) => {
    console.log("data is ",property);
  if (!token) return alert('Please login to save and predict');
  
  const payload = {
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms
  };
console.log('Payload sent to backend:', payload);

  try {
    const res = await axios.post('http://localhost:8000/predict', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert(`Predicted price: ${res.data.predicted_price}`);
  } catch (err) {
    console.error(err);
    alert('Predict/save failed');
  }
};


  return (
    <div>
      <section id="search" className="card">
        <h2>Find Homes</h2>
        <div className="search-row">
          <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <input placeholder="Budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
          <input placeholder="Bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
          <input placeholder="Free text (e.g. sea view)" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <small className="muted">Results update as you type.</small>
      </section>

      <section className="card">
        <h2>Results</h2>
        <PropertyList properties={results} onSave={handleSave} onPredict={handlePredictSave} />
      </section>
{/* 
      <section id="auth" className="card split">
        <div>
          <h3>Sign up</h3>
          <SignupForm />
        </div>
        <div>
          <h3>Login</h3>
          <LoginForm />
        </div>
      </section> */}

      <section id="saved" className="card">
        <h2>Saved Properties</h2>
        <SavedList saved={saved} />
      </section>
    </div>
  );
}
