import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Background worker: shows reminders and makes FITORA installable as an app (Android / desktop)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/fitora-sw.js', { scope: '/' }).catch(() => {});
  });
}
