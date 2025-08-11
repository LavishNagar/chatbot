import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';
import { AuthContext } from './AuthProvider';

export default function LoginForm({ onClose }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handle(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        alert('Logged in');
        onClose();
      } else {
        alert('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={handle} className="auth-form">
      <h2>Sign in</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <button type="button" onClick={onClose} className="btn small">Cancel</button>
    </form>
  );
}
