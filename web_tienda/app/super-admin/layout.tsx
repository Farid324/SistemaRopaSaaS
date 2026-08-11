'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// SVG genérico para el menú hamburguesa
const MenuIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Iconos genéricos para el sidebar
const HomeIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BusinessIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PlanIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ConfigIcon = () => (
  <svg xmlns="http://www.w3.nlm.nih.gov/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: 'Dashboard', href: '/super-admin', icon: <HomeIcon /> },
    { name: 'Empresas', href: '/super-admin/empresas', icon: <BusinessIcon /> },
    { name: 'Clientes', href: '/super-admin/clientes', icon: <BusinessIcon /> },
    { name: 'Suscripciones', href: '/super-admin/planes', icon: <PlanIcon /> },
    { name: 'Configuración', href: '/super-admin/configuracion', icon: <ConfigIcon /> },
  ];

  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-indigo-900 text-white transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-800 h-16">
          <h2 className={`font-bold text-lg truncate transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            SaaS Admin
          </h2>
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-indigo-800 rounded-lg focus:outline-none"
            title="Toggle Sidebar"
          >
            <MenuIcon />
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span
                      className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                        isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <Link href="/">
            <button className="flex items-center w-full p-3 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors">
               <span className="shrink-0"><LogoutIcon /></span>
               <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                 Salir a Tienda
               </span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10 shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Panel de Control Global
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-gray-900">Super Admin</span>
              <span className="text-xs text-gray-500 leading-tight">admin@sistema.com</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
