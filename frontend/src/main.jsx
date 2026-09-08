import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Automatically append ngrok-skip-browser-warning header for ngrok tunnels
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
  if (url && typeof url === 'string' && url.includes('ngrok')) {
    const headers = new Headers(init.headers || (typeof input === 'object' && input.headers ? input.headers : {}));
    if (!headers.has('ngrok-skip-browser-warning')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    return originalFetch(input, { ...init, headers });
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
