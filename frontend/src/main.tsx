import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { OrbitApp } from './OrbitApp';
import './theme/globals.css';
import './orbit.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OrbitApp />
    </BrowserRouter>
  </StrictMode>,
);
