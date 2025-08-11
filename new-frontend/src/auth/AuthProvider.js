import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

/*
  Expectation: backend returns { token, user } on signup / login.
  We store token in localStorage and set user from response.user.
*/
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // user: { id, email, name }
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (tokenValue, userObj) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(tokenValue);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
