import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/glassmorphism.css'
import './styles/brand-overrides.css'
import { ThemeProvider } from './context/ThemeContext'
import { initializeEmailService } from './integrations/email.init'
import { debugEmailConfig } from './integrations/email.debug'

// Initialize EmailJS for sending emails
const emailInitialized = initializeEmailService();
// console.log('EmailJS initialization result:', emailInitialized);

// Make email debugging utilities available in window for troubleshooting
if (typeof window !== 'undefined') {
  (window as any).debugEmailJS = debugEmailConfig;
}

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Hide pre-boot loader once React is mounted
try {
  const el = document.getElementById('preload-overlay');
  if (el) {
    el.classList.add('opacity-0');
    setTimeout(() => {
      el.remove();
    }, 200);
  }
} catch {}
