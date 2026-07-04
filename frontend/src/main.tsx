import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OrbitApp } from './OrbitApp';
import './theme/globals.css';
import './orbit.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrbitApp />
  </StrictMode>,
);
