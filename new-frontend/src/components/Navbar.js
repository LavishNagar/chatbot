import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="nav">
      <div className="nav-left">
        <h1 className="brand">Agent Mira</h1>
        <span className="tagline">Real Estate Chatbot</span>
      </div>

      <nav className="nav-right">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/saved">Saved</Link>
        <Link to="/compare">Compare</Link>
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name || user.email}</span>
            <button className="btn small" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn small" to="/login">Sign in</Link>
            <Link className="btn small" to="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
