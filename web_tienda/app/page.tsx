// app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import AuthModal from './components/modals/AuthModal';
import UpgradeModal from './components/modals/UpgradeModal';

export type UserRole = 'GUEST' | 'CLIENTE' | 'OWNER_PRINCIPAL';

export default function Home() {
  const [view, setView] = useState<'marketplace' | 'vendedores'>('marketplace');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState<UserRole>('GUEST');
  
  const [authModalView, setAuthModalView] = useState<'LOGIN' | 'REGISTER' | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);

  // Cambiar clases del body para un modo oscuro global
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (user: any, token: string) => {
    // Aquí podrías guardar el token en localStorage/cookies si quisieras
    localStorage.setItem('token', token);
    setUserData(user);
    setRole(user.rol as UserRole);
    setAuthModalView(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setRole('GUEST');
  };

  const handleUpgrade = (plan: string) => {
    if (role === 'GUEST') {
      alert("Primero debes iniciar sesión como cliente");
      setAuthModalView('LOGIN');
      return;
    }
    if (role === 'OWNER_PRINCIPAL') {
      alert("¡Ya eres el Owner de una empresa! Ve al Panel Web o a la App Móvil para administrar tu tienda.");
      return;
    }
    if (role !== 'CLIENTE') {
      alert("Esta cuenta está registrada como trabajador en otra empresa. Para crear tu propia tienda, cierra sesión y regístrate con tu correo personal.");
      return;
    }
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = (data: any) => {
    // Si la solicitud queda pendiente, mostramos alerta y reseteamos. No lo hacemos OWNER de inmediato.
    if (data.isPending) {
      alert(data.message || "Tu solicitud está pendiente de aprobación por el Super Admin.");
    } else {
      localStorage.setItem('token', data.token);
      setRole('OWNER_PRINCIPAL');
      alert("¡Felicidades! Tu empresa ha sido registrada. Ahora puedes descargar la App Móvil para gestionar tu inventario.");
    }
    setShowUpgradeModal(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} selection:bg-indigo-500 selection:text-white`}>
      
      {/* NAVBAR */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-neutral-950/80 border-neutral-800' : 'bg-white/80 border-neutral-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-violet-500">
                ClickModa
              </span>
              <div className={`hidden md:flex space-x-1 p-1 rounded-full ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                <button 
                  onClick={() => setView('marketplace')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'marketplace' ? (isDarkMode ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-indigo-900 shadow-sm') : (isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')}`}
                >
                  Para Compradores
                </button>
                <button 
                  onClick={() => setView('vendedores')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'vendedores' ? (isDarkMode ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-indigo-900 shadow-sm') : (isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')}`}
                >
                  Para Vendedores
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {role === 'GUEST' ? (
                <>
                  <button onClick={() => setAuthModalView('LOGIN')} className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>
                    Iniciar Sesión
                  </button>
                  <button onClick={() => setAuthModalView('REGISTER')} className={`text-sm font-medium px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isDarkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}>
                    Registrarse
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    Hola, {userData ? userData.nombreCompleto.split(' ')[0] : 'Usuario'} ({role})
                  </span>
                  {role === 'OWNER_PRINCIPAL' && (
                    <button className="text-sm font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-all shadow-sm">
                      Ir al Panel Web
                    </button>
                  )}
                  <button onClick={handleLogout} className={`text-sm text-neutral-500 hover:underline`}>
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'marketplace' ? <MarketplaceView isDarkMode={isDarkMode} /> : <VendedoresView isDarkMode={isDarkMode} onSelectPlan={handleUpgrade} />}
      </main>

      {/* MODAL DE AUTENTICACIÓN REAL */}
      {authModalView && (
        <AuthModal 
          isDarkMode={isDarkMode} 
          initialView={authModalView}
          onClose={() => setAuthModalView(null)} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* MODAL DE CONVERSIÓN A EMPRESA (B2B UPGRADE) */}
      {showUpgradeModal && (
        <UpgradeModal
          isDarkMode={isDarkMode}
          planName={selectedPlan}
          userData={userData}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={handleUpgradeSuccess}
        />
      )}

    </div>
  );
}

function MarketplaceView({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-3xl mx-auto py-16">
        <h1 className={`text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          La mejor ropa de tiendas locales, <span className="text-indigo-500">en un solo lugar.</span>
        </h1>
        <p className={`text-xl mb-10 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Explora las colecciones de cientos de tiendas registradas. Inicia sesión para comprar, guardar tus favoritos y seguir tus pedidos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="group cursor-pointer">
            <div className={`rounded-2xl aspect-3/4 overflow-hidden mb-4 relative ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <button className="w-full bg-white text-black font-semibold py-2 rounded-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Ver Detalles
                </button>
              </div>
            </div>
            <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Chaqueta Urbana {i}</h3>
            <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}>Tienda Ejemplo {i}</p>
            <p className="font-bold text-indigo-500 mt-1">150 Bs.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendedoresView({ isDarkMode, onSelectPlan }: { isDarkMode: boolean, onSelectPlan: (plan: string) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-3xl mx-auto py-16">
        <span className={`text-sm font-semibold px-4 py-1.5 rounded-full uppercase tracking-wide ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>
          ClickModa para Empresas
        </span>
        <h1 className={`text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 mt-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Digitaliza tu tienda de ropa. <br/>Vende más, administra mejor.
        </h1>
        <p className={`text-xl mb-10 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Únete como Owner Principal. Registra tu empresa, gestiona tu inventario desde nuestra App Móvil, y publica tus prendas directamente en nuestro marketplace web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
        {/* Plan Semilla */}
        <div className={`rounded-3xl p-8 border shadow-sm hover:shadow-xl transition-shadow relative ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Plan Semilla</h3>
          <p className={`mt-2 h-12 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Ideal para probar el sistema y dejar el cuaderno.</p>
          <div className="my-6">
            <span className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Gratis</span>
            <span className={isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}> /por siempre</span>
          </div>
          <ul className={`space-y-3 mb-8 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            <li className="flex gap-2 items-center">✓ 1 Sucursal</li>
            <li className="flex gap-2 items-center">✓ Máx. 2 empleados</li>
            <li className="flex gap-2 items-center font-semibold">✓ Hasta 500 prendas</li>
            <li className="flex gap-2 items-center text-neutral-500 line-through">Venta en marketplace web</li>
          </ul>
          <button onClick={() => onSelectPlan('Plan Semilla')} className={`w-full font-semibold py-3 rounded-xl transition-colors ${isDarkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}>
            Crear mi Empresa Gratis
          </button>
        </div>

        {/* Plan Crecimiento */}
        <div className={`bg-linear-to-b from-indigo-900 to-violet-900 rounded-3xl p-8 shadow-2xl transform md:-translate-y-4 relative border border-indigo-700 text-white`}>
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Más Popular
            </span>
          </div>
          <h3 className="text-2xl font-bold">Plan Crecimiento</h3>
          <p className="text-indigo-200 mt-2 h-12">El equilibrio perfecto para tiendas en crecimiento.</p>
          <div className="my-6">
            <span className="text-4xl font-extrabold">100 Bs</span>
            <span className="text-indigo-200"> /mes</span>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-2 items-center">✓ Hasta 3 Sucursales</li>
            <li className="flex gap-2 items-center">✓ Máx. 10 empleados</li>
            <li className="flex gap-2 items-center font-semibold text-amber-300">✓ Hasta 3,000 prendas</li>
            <li className="flex gap-2 items-center font-semibold">✓ Activación de venta web</li>
            <li className="flex gap-2 items-center">✓ 2 meses gratis (pago anual)</li>
          </ul>
          <button onClick={() => onSelectPlan('Plan Crecimiento')} className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-neutral-100 transition-colors shadow-lg shadow-indigo-900/50">
            Elegir Crecimiento
          </button>
        </div>

        {/* Plan Corporativo */}
        <div className={`rounded-3xl p-8 border shadow-sm hover:shadow-xl transition-shadow relative ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Plan Corporativo</h3>
          <p className={`mt-2 h-12 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Para tiendas grandes que necesitan máxima potencia.</p>
          <div className="my-6">
            <span className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>250 Bs</span>
            <span className={isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}> /mes</span>
          </div>
          <ul className={`space-y-3 mb-8 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            <li className="flex gap-2 items-center">✓ Sucursales ilimitadas</li>
            <li className="flex gap-2 items-center">✓ Empleados ilimitados</li>
            <li className="flex gap-2 items-center text-indigo-500 font-bold">✓ Prendas Ilimitadas*</li>
            <li className="flex gap-2 items-center">✓ Soporte prioritario directo</li>
          </ul>
          <button onClick={() => onSelectPlan('Plan Corporativo')} className={`w-full font-semibold py-3 rounded-xl transition-colors ${isDarkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}>
            Contactar Ventas
          </button>
        </div>
      </div>
      <p className="text-center text-neutral-500 text-xs mt-6">*Sujeto a política de uso justo (hasta 15,000 prendas).</p>
    </div>
  );
}
