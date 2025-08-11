import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import { AuthContext } from './AuthProvider';

export default function SignupForm({ onClose }) {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handle(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, { name, email, password });
      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        alert('Signed up and logged in');
        onClose();
      } else {
        alert('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <form onSubmit={handle} className="auth-form">
      <h2>Sign up</h2>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Signup</button>
      <button type="button" onClick={onClose} className="btn small">Cancel</button>
    </form>
  );
}
