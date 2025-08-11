import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        © {new Date().getFullYear()} Agent Mira — Built with React, Node & FastAPI
      </div>
      <div className="footer-links">
        <a href="#about">About</a> · <a href="#contact">Contact</a>
      </div>
    </footer>
  );
}
