import React, { useState } from 'react';
import { GoogleLogin, googleLogout, type CredentialResponse } from '@react-oauth/google';
import { LogOut, User, CheckCircle2 } from 'lucide-react';
import { getUser, saveUser, clearUser, decodeJwt, type UserProfile } from '../services/authService';

interface GoogleAuthButtonProps {
  onAuthChange?: (user: UserProfile | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onAuthChange }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getUser());
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    setAuthError(null);
    if (!credentialResponse.credential) {
      setAuthError('No se recibió la credencial de autenticación.');
      return;
    }

    const decoded = decodeJwt(credentialResponse.credential);
    if (!decoded) {
      setAuthError('Error al decodificar las credenciales de Google.');
      return;
    }

    const profile: UserProfile = {
      id: String(decoded.sub || Date.now()),
      name: String(decoded.name || 'Usuario Google'),
      email: String(decoded.email || 'usuario@google.com'),
      picture: String(decoded.picture || ''),
      provider: 'google',
      loginTimestamp: new Date().toISOString()
    };

    saveUser(profile);
    setUser(profile);
    if (onAuthChange) onAuthChange(profile);
  };

  const handleDemoLogin = () => {
    setAuthError(null);
    const demoProfile: UserProfile = {
      id: 'demo-user-123',
      name: 'Daniel Cultivador',
      email: 'daniel@laspaginasdedani.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'demo',
      loginTimestamp: new Date().toISOString()
    };

    saveUser(demoProfile);
    setUser(demoProfile);
    if (onAuthChange) onAuthChange(demoProfile);
  };

  const handleLogout = () => {
    googleLogout();
    clearUser();
    setUser(null);
    if (onAuthChange) onAuthChange(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-[#EAF2E8] border border-[#2D5A27]/20 px-3 py-1.5 rounded-xl">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-[#2D5A27]/30 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-[#1A231E] leading-tight flex items-center gap-1">
            {user.name}
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] inline" />
          </p>
          <p className="text-[10px] text-[#5A655E] truncate max-w-[130px]">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="p-1.5 rounded-lg text-[#5A655E] hover:text-[#A32A2A] hover:bg-white/80 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-2">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setAuthError('Error de autenticación con Google.')}
          shape="circle"
          size="medium"
          text="signin_with"
        />
        <button
          type="button"
          onClick={handleDemoLogin}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition-colors cursor-pointer"
          title="Acceso de prueba demo"
        >
          <User className="w-3.5 h-3.5" />
          <span>Demo</span>
        </button>
      </div>
      {authError && <p className="text-[11px] text-[#A32A2A]">{authError}</p>}
    </div>
  );
};
