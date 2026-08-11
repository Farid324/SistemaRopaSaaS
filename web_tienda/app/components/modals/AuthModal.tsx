'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type AuthView = 'LOGIN' | 'REGISTER' | 'VERIFY';

export interface AuthModalProps {
  isDarkMode: boolean;
  initialView?: AuthView;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

function CustomGoogleButton({ isDarkMode, text, onClick, isLoading }: { isDarkMode: boolean, text: string, onClick: () => void, isLoading: boolean }) {
  return (
    <Button 
      variant="outline"
      isDarkMode={isDarkMode}
      fullWidth
      onClick={onClick}
      isLoading={isLoading}
      className="mb-4 py-3.5"
    >
      {!isLoading && (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {text}
    </Button>
  );
}

function AuthContent({ isDarkMode, initialView = 'LOGIN', onClose, onLoginSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados Formulario
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');

  // Checkboxes
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [recibirNovedades, setRecibirNovedades] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  // Estados Verificación
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setError('');
  }, [view]);

  // Manejar Login Manual
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo || !password) {
      setError('Por favor, ingresa tu correo y contraseña');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/web/auth/login-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          setView('VERIFY');
        } else {
          setError(data.message || 'Error al iniciar sesión');
        }
      } else {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Registro Manual
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptoTerminos) return;

    if (nombreCompleto.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== repetirPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/web/auth/registrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password, nombreCompleto }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al registrarse');
      } else {
        setView('VERIFY');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Verificación de PIN
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigo = pin.join('');
    if (codigo.length < 6) {
      setError('Ingresa el código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/web/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, pin: codigo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Código incorrecto');
      } else {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
        );
        const payload = userInfo.data;

        const res = await fetch('http://localhost:4000/api/web/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            googleId: payload.sub,
            correo: payload.email,
            nombreCompleto: payload.name,
            fotoPerfil: payload.picture
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Error con Google Auth');
        } else {
          onLoginSuccess(data.user, data.token);
        }
      } catch (err) {
        console.error(err);
        setError('Error procesando Google Auth');
      } finally {
        setIsLoading(false);
      }
    },
    onError: errorResponse => {
      console.error(errorResponse);
      setError('Fallo al conectar con Google');
    },
  });

  // Manejo de Inputs del PIN
  const handlePinChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className={`w-full max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl shadow-2xl relative transition-all duration-300 transform scale-100 ${
          isDarkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
        }`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          ✕
        </button>

        {view === 'LOGIN' && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="text-center">
              <h2 className={`text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-violet-500`}>Bienvenido de nuevo</h2>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Inicia sesión para continuar comprando.</p>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm text-center">{error}</div>}

            <CustomGoogleButton 
              isDarkMode={isDarkMode} 
              text="Continuar con Google" 
              onClick={() => googleLogin()} 
              isLoading={isLoading} 
            />

            <div className="flex items-center gap-3 mb-6">
              <hr className={`flex-1 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>o manualmente</span>
              <hr className={`flex-1 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`} />
            </div>

            <form onSubmit={handleLogin}>
              <Input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                label="Correo electrónico"
                isDarkMode={isDarkMode}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <Input 
                type="password" 
                placeholder="••••••••" 
                label="Contraseña"
                isDarkMode={isDarkMode}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <div className="flex items-center justify-between mb-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={mantenerSesion}
                    onChange={(e) => setMantenerSesion(e.target.checked)}
                  />
                  <span className={`text-sm select-none transition-colors group-hover:text-indigo-500 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Mantener sesión
                  </span>
                </label>
                
                <button type="button" className={`text-sm font-medium hover:underline transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button 
                type="submit" 
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Iniciar Sesión
              </Button>
            </form>

            <p className={`text-center mt-6 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              ¿No tienes cuenta? <button onClick={() => setView('REGISTER')} className={`font-bold hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>Regístrate</button>
            </p>
          </div>
        )}

        {view === 'REGISTER' && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="text-center">
              <h2 className={`text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-violet-500`}>Crea tu cuenta</h2>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Únete a ClickModa en segundos.</p>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm text-center">{error}</div>}

            <CustomGoogleButton 
              isDarkMode={isDarkMode} 
              text="Registrarse con Google" 
              onClick={() => googleLogin()} 
              isLoading={isLoading} 
            />

            <div className="flex items-center gap-3 mb-6">
              <hr className={`flex-1 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>o con tu correo</span>
              <hr className={`flex-1 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`} />
            </div>

            <form onSubmit={handleRegister}>
              <Input 
                type="text" 
                placeholder="Juan Pérez" 
                label="Nombre completo"
                isDarkMode={isDarkMode}
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />
              <Input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                label="Correo electrónico"
                isDarkMode={isDarkMode}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                <div className="flex-1">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    label="Contraseña"
                    isDarkMode={isDarkMode}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    label="Repetir contraseña"
                    isDarkMode={isDarkMode}
                    value={repetirPassword}
                    onChange={(e) => setRepetirPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6 mt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={mantenerSesion}
                    onChange={(e) => setMantenerSesion(e.target.checked)}
                  />
                  <span className={`text-sm select-none transition-colors group-hover:text-indigo-500 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Mantener sesión
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={recibirNovedades}
                    onChange={(e) => setRecibirNovedades(e.target.checked)}
                  />
                  <span className={`text-sm select-none transition-colors group-hover:text-indigo-500 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Quiero recibir novedades y ofertas exclusivas
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    checked={aceptoTerminos}
                    onChange={(e) => setAceptoTerminos(e.target.checked)}
                  />
                  <span className={`text-sm select-none transition-colors group-hover:text-indigo-500 leading-snug ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    He leído y acepto las <span className="font-bold underline">Condiciones de uso</span> y entiendo la <span className="font-bold underline">Política de Privacidad</span>. *
                  </span>
                </label>
              </div>

              <Button 
                type="submit" 
                variant={isDarkMode ? 'secondary' : 'secondary'}
                fullWidth
                disabled={isLoading || !aceptoTerminos}
                isLoading={isLoading}
              >
                Crear Cuenta
              </Button>
            </form>

            <p className={`text-center mt-6 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              ¿Ya tienes cuenta? <button onClick={() => setView('LOGIN')} className={`font-bold hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>Inicia sesión</button>
            </p>
          </div>
        )}

        {view === 'VERIFY' && (
          <div className="animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Revisa tu correo</h2>
            <p className={`text-sm mb-8 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Hemos enviado un código de 6 dígitos a <br/><span className="font-semibold text-indigo-500">{correo}</span>
            </p>

            {error && <div className="mb-6 w-full p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleVerify} className="w-full">
              <div className="flex justify-between gap-1 sm:gap-2 mb-8">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { pinRefs.current[idx] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinChange(idx, e.target.value)}
                    onKeyDown={e => handlePinKeyDown(idx, e)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode 
                        ? 'bg-neutral-800 border-neutral-700 text-white focus:bg-neutral-700' 
                        : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              <Button 
                type="submit" 
                variant="primary"
                fullWidth
                disabled={isLoading || pin.join('').length < 6}
                isLoading={isLoading}
              >
                Verificar Código
              </Button>
            </form>

            <button 
              type="button" 
              className={`mt-6 text-sm font-medium hover:underline transition-colors ${isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
              onClick={async () => {
                try {
                  await fetch('http://localhost:4000/api/web/auth/reenviar-verificacion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo }),
                  });
                  alert('Código reenviado. Revisa tu bandeja de entrada.');
                } catch(e) {}
              }}
            >
              ¿No recibiste el código? Reenviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Envolvemos el contenido en el Provider
export default function AuthModal(props: AuthModalProps) {
  return (
    <GoogleOAuthProvider clientId="242684973748-2kagtmgr5f8aus1n829oetoppskqpslr.apps.googleusercontent.com">
      <AuthContent {...props} />
    </GoogleOAuthProvider>
  );
}
