import { UserAvatar } from './UserAvatar';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleLogin, googleLogout, type CredentialResponse } from '@react-oauth/google';
import { LogOut, User, CheckCircle2, ShieldCheck, AlertCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUser, saveUser, clearUser, decodeJwt, subscribeAuth, type UserProfile } from '../services/authService';
import { hasAcceptedLegalConsents, setAcceptedLegalConsents } from '../services/consentService';
import { recordConsentEvent } from '../services/auditLogger';
import type { PageRoute } from '../types/huerta';

interface GoogleAuthButtonProps {
  user?: UserProfile | null;
  onAuthChange?: (user: UserProfile | null) => void;
  onNavigate?: (route: PageRoute) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ user: propUser, onAuthChange, onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => propUser !== undefined ? propUser : getUser());
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal de consentimientos antes de Google Login
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consentsGiven, setConsentsGiven] = useState<boolean>(() => hasAcceptedLegalConsents());

  // Modal informativo sobre el funcionamiento de la demo
  const [showDemoInfoModal, setShowDemoInfoModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth((updatedUser) => {
      setCurrentUser(updatedUser);
    });
    return unsubscribe;
  }, []);

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

    // Registrar los consentimientos aceptados
    recordConsentEvent({
      consentType: 'Política de Privacidad',
      status: 'Aceptado',
      acceptanceMethod: 'Casilla independiente previa a inicio de sesión con Google',
      formOrigin: 'Modal de Inicio de Sesión',
      userIdentifier: String(decoded.email || '')
    });

    recordConsentEvent({
      consentType: 'Términos y Condiciones',
      status: 'Aceptado',
      acceptanceMethod: 'Casilla independiente previa a inicio de sesión con Google',
      formOrigin: 'Modal de Inicio de Sesión',
      userIdentifier: String(decoded.email || '')
    });

    setAcceptedLegalConsents(true);
    setConsentsGiven(true);
    setShowConsentModal(false);

    const profile: UserProfile = {
      id: String(decoded.sub || Date.now()),
      name: String(decoded.name || 'Usuario Google'),
      email: String(decoded.email || 'usuario@google.com'),
      picture: String(decoded.picture || ''),
      provider: 'google',
      loginTimestamp: new Date().toISOString()
    };

    saveUser(profile);
    if (onAuthChange) onAuthChange(profile);
  };

  // Abrir modal de demo
  const handleOpenDemoInfo = () => {
    setShowDemoInfoModal(true);
  };

  // Ejecutar demo login
  const handleConfirmDemoLogin = () => {
    setAuthError(null);
    setShowDemoInfoModal(false);

    const demoProfile: UserProfile = {
      id: 'demo-user-123',
      name: 'Daniel Cultivador',
      email: 'daniel@laspaginasdedani.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'demo',
      loginTimestamp: new Date().toISOString()
    };

    saveUser(demoProfile);
    if (onAuthChange) onAuthChange(demoProfile);
  };

  const handleLogout = () => {
    googleLogout();
    clearUser();
    if (onAuthChange) onAuthChange(null);
  };

  const user = propUser !== undefined ? propUser : currentUser;

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-[#EAF2E8] border border-[#2D5A27]/20 px-3 py-1.5 rounded-xl">
        <UserAvatar
          name={user.name}
          picture={user.picture}
          isDonor={user.isDonor}
          size="sm"
        />
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
    <>
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2">
          {/* Botón de Iniciar Sesión con Google que abre el modal de consentimientos si no se han dado */}
          {consentsGiven ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setAuthError('Error de autenticación con Google.')}
              shape="circle"
              size="medium"
              text="signin_with"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setConsentError(null);
                setShowConsentModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#D5E0D3] text-[#1A231E] hover:border-[#2D5A27] hover:shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Acceder con Google</span>
            </button>
          )}

          {/* Botón Demo con modal explicativo */}
          <button
            type="button"
            onClick={handleOpenDemoInfo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition-colors cursor-pointer"
            title="Conocer y probar la demo"
          >
            <User className="w-3.5 h-3.5" />
            <span>Demo</span>
          </button>
        </div>

        {authError && <p className="text-[11px] text-[#A32A2A]">{authError}</p>}
      </div>

      {/* Ventana Emergente (Modal): Consentimientos legales antes de iniciar sesión con Google montada en Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showConsentModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#E2DFD7] p-6 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-auto"
              >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A231E]">
                      Iniciar sesión con Google
                    </h3>
                    <p className="text-xs text-[#5A655E]">
                      Términos de servicio y privacidad
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#4A554E] leading-relaxed">
                Para sincronizar tus cultivos, bancales y tareas en tu cuenta, acepta los términos y la política de privacidad (Responsable: <strong>las paginas de dani</strong>):
              </p>

              {consentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{consentError}</span>
                </div>
              )}

              {/* Casillas de consentimiento independientes */}
              <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E2DFD7] text-xs text-[#4A554E]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => {
                      setAcceptedPrivacy(e.target.checked);
                      setConsentError(null);
                    }}
                    className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span>
                    He leído y acepto la{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowConsentModal(false);
                        if (onNavigate) onNavigate('privacidad');
                      }}
                      className="underline font-semibold text-[#2D5A27] hover:text-[#1A231E]"
                    >
                      Política de Privacidad
                    </button>
                    . *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setConsentError(null);
                    }}
                    className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span>
                    Acepto los{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowConsentModal(false);
                        if (onNavigate) onNavigate('terminos');
                      }}
                      className="underline font-semibold text-[#2D5A27] hover:text-[#1A231E]"
                    >
                      Términos y Condiciones
                    </button>
                    . *
                  </span>
                </label>
              </div>

              {/* Botón de Google condicionado a los consentimientos */}
              <div className="pt-1 flex flex-col items-center gap-2">
                {acceptedPrivacy && acceptedTerms ? (
                  <div className="w-full flex justify-center py-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setAuthError('Error de autenticación con Google.')}
                      shape="circle"
                      size="large"
                      text="signin_with"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!acceptedPrivacy || !acceptedTerms) {
                        setConsentError('Marca ambas casillas independientes para continuar con Google.');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#E2DFD7] text-[#5A655E] text-xs font-semibold cursor-not-allowed text-center"
                  >
                    Marca las casillas para activar el acceso con Google
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="text-xs text-[#5A655E] hover:text-[#1A231E] underline pt-1 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* Ventana Emergente (Modal): Información sobre el funcionamiento de la demo montada en Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDemoInfoModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#E2DFD7] p-6 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-auto"
              >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A231E]">
                      ¿Cómo funciona el Modo Demo?
                    </h3>
                    <p className="text-xs text-[#5A655E]">
                      Acceso libre e inmediato sin registro
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoInfoModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#4A554E] leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-2">
                  <p className="font-semibold text-[#1A231E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    <span>Totalmente funcional</span>
                  </p>
                  <p>
                    Puedes explorar toda la huerta, registrar riegos, avanzar etapas, crear cultivos nuevos, gestionar bancales y marcar labores en el calendario.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-2">
                  <p className="font-semibold text-[#1A231E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    <span>Almacenamiento local en tu navegador</span>
                  </p>
                  <p>
                    Tus cambios se guardan localmente en este dispositivo. No requiere cuenta de Google ni contraseñas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-2">
                  <p className="font-semibold text-[#1A231E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    <span>Sin compromisos ni formularios</span>
                  </p>
                  <p>
                    Ideal para probar la experiencia de inmediato sin vincular datos personales.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoInfoModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDemoLogin}
                  className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
                >
                  Entrar a la Demo ahora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};
