'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface UpgradeModalProps {
  isDarkMode: boolean;
  planName: string;
  userData: any;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function UpgradeModal({ isDarkMode, planName, userData, onClose, onSuccess }: UpgradeModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const isFreePlan = planName === 'Plan Semilla';

  useEffect(() => {
    fetch('http://localhost:4000/api/web/config/qr')
      .then(res => res.json())
      .then(data => {
        if (data.qrUrl) setQrUrl(data.qrUrl);
      })
      .catch(err => console.error(err));
  }, []);

  // Formularios
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [ci, setCi] = useState(userData?.ci && !userData.ci.startsWith('GOOGLE') && !userData.ci.startsWith('CLIENTE') ? userData.ci : '');
  const [telefono, setTelefono] = useState(userData?.telefono || '');
  const [edad, setEdad] = useState(userData?.edad?.toString() || '');

  // Simulación de fotos (para MVP)
  const [fotoAnverso, setFotoAnverso] = useState<File | null>(null);
  const [fotoReverso, setFotoReverso] = useState<File | null>(null);

  const handleNextStep = () => {
    setError('');
    if (step === 1 && nombreEmpresa.trim().length < 3) {
      setError('El nombre de la empresa debe tener al menos 3 caracteres.');
      return;
    }
    if (step === 2) {
      if (ci.length < 5) return setError('Ingresa un CI válido.');
      if (telefono.length < 7) return setError('Ingresa un teléfono válido.');
      if (!edad || parseInt(edad) < 18) return setError('Debes ser mayor de edad.');
      if (!isFreePlan && (!fotoAnverso || !fotoReverso)) {
        return setError('Debes subir las fotos de tu CI.');
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const planId = planName === 'Plan Semilla' ? 'plan-semilla' : 
                     planName === 'Plan Crecimiento' ? 'plan-crecimiento' : 'plan-corporativo';

      const response = await fetch('http://localhost:4000/api/web/auth/upgrade-to-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreEmpresa,
          planId,
          ci,
          telefono,
          edad: parseInt(edad),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al procesar la solicitud');
        setIsLoading(false);
        return;
      }

      setStep(4); // Pasar a pantalla final
      setTimeout(() => {
        onSuccess(data);
      }, 3000);
      
    } catch (err) {
      setError('Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className={`w-full max-w-lg mx-auto my-8 p-6 sm:p-8 rounded-3xl shadow-2xl relative transition-all duration-300 ${
          isDarkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
        }`}
      >
        {step < 4 && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        )}

        {/* Indicador de progreso */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= num 
                    ? 'bg-indigo-600 text-white' 
                    : isDarkMode ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-colors ${
                    step > num 
                      ? 'bg-indigo-600' 
                      : isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {error && <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        {/* PASO 1: EMPRESA */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-4">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Datos de la Empresa</h2>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Plan elegido: <strong className="text-indigo-500">{planName}</strong>
            </p>

            <Input 
              label="Nombre de tu Tienda / Empresa *"
              placeholder="Ej. ClickModa Boutique"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              isDarkMode={isDarkMode}
              autoFocus
            />

            <Button fullWidth onClick={handleNextStep} className="mt-4">
              Continuar
            </Button>
          </div>
        )}

        {/* PASO 2: DATOS PERSONALES */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-4">
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Datos del Propietario</h2>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Requerido por seguridad para activar el panel de administración.
            </p>

            <Input 
              label="Nombre y Apellidos"
              value={userData?.nombreCompleto || ''}
              isDarkMode={isDarkMode}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <Input 
              label="Correo electrónico"
              value={userData?.correo || ''}
              isDarkMode={isDarkMode}
              disabled
              className="opacity-60 cursor-not-allowed"
            />

            <div className="flex gap-4">
              <Input 
                label="Carnet de Identidad *"
                placeholder="12345678"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                isDarkMode={isDarkMode}
              />
              <Input 
                label="Edad *"
                placeholder="25"
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                isDarkMode={isDarkMode}
              />
            </div>
            
            <Input 
              label="Teléfono de contacto *"
              placeholder="70012345"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              isDarkMode={isDarkMode}
            />

            {!isFreePlan && (
              <div className="mt-4 mb-6">
                <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Fotos del CI (Requerido para pagos) *
                </label>
                <div className="flex gap-4">
                  <div className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${fotoAnverso ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30' : (isDarkMode ? 'border-neutral-700' : 'border-neutral-300')}`}>
                    <input type="file" className="hidden" id="anverso" onChange={(e) => e.target.files && setFotoAnverso(e.target.files[0])} />
                    <label htmlFor="anverso" className="cursor-pointer flex flex-col items-center">
                      <span className="mb-2 text-indigo-500">
                        {fotoAnverso ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </span>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{fotoAnverso ? 'Cargado' : 'Anverso'}</span>
                    </label>
                  </div>
                  <div className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${fotoReverso ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30' : (isDarkMode ? 'border-neutral-700' : 'border-neutral-300')}`}>
                    <input type="file" className="hidden" id="reverso" onChange={(e) => e.target.files && setFotoReverso(e.target.files[0])} />
                    <label htmlFor="reverso" className="cursor-pointer flex flex-col items-center">
                      <span className="mb-2 text-indigo-500">
                        {fotoReverso ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </span>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{fotoReverso ? 'Cargado' : 'Reverso'}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={handleBack} className="flex-1">Atrás</Button>
              <Button variant="primary" onClick={handleNextStep} className="flex-2">Continuar</Button>
            </div>
          </div>
        )}

        {/* PASO 3: PAGO QR (o confirmar directo si es free) */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 text-center">
            {isFreePlan ? (
              <>
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Confirmar Suscripción</h2>
                <p className={`text-sm mb-8 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  El Plan Semilla es totalmente gratuito. Confirma para activar tu cuenta.
                </p>
                <div className="flex gap-3 mt-8">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">Atrás</Button>
                  <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="flex-2">Finalizar Registro</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Pago de Suscripción</h2>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Monto a pagar: <strong className="text-xl text-indigo-500">{planName === 'Plan Crecimiento' ? '100' : '250'} Bs</strong>
                </p>

                <div className="bg-white p-4 rounded-2xl mx-auto inline-block border-4 border-indigo-50 shadow-xl mb-6">
                  {qrUrl ? (
                    <img src={qrUrl} alt="QR de Pago" className="max-w-[200px] max-h-[200px] object-contain" />
                  ) : (
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PendienteDeConfigurar" alt="QR de Pago Default" className="w-48 h-48" />
                  )}
                </div>
                
                <p className={`text-xs mb-8 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Escanea el código QR desde tu aplicación bancaria. Una vez transferido, haz clic en el botón de abajo.
                </p>

                <div className="flex gap-3 mt-8">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">Atrás</Button>
                  <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="flex-2">Ya realicé el pago</Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PASO 4: VERIFICACIÓN FINAL PENDIENTE */}
        {step === 4 && (
          <div className="animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>¡Solicitud Recibida!</h2>
            <p className={`text-sm mb-8 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Tu solicitud para crear la empresa <span className="font-bold text-indigo-500">{nombreEmpresa}</span> ha sido enviada con éxito.
              Un super administrador revisará tus datos y aprobará tu cuenta muy pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
