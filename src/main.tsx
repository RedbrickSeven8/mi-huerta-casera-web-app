import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.tsx';
import { getCustomClientId } from './services/authService';

const GOOGLE_CLIENT_ID =
  getCustomClientId() ||
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '585678535251-i8ke2ih1vfohfdtbclb348gn6u31udb8.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
