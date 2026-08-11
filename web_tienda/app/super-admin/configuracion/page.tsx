'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPage() {
  const [qrUrl, setQrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/web/config/qr');
      const data = await res.json();
      setQrUrl(data.qrUrl || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        router.push('/super-admin/login');
        return;
      }

      const res = await fetch('http://localhost:4000/api/web/config/qr', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrUrl })
      });

      if (res.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        const err = await res.json();
        alert(err.message || 'Error al guardar');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h1>
        <p className="text-gray-500">Administra las variables y configuraciones globales.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Métodos de Pago</h2>
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Código QR (Depósitos/Transferencias)
            </label>
            <input
              type="url"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="https://ejemplo.com/mi-qr.png"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 bg-gray-50 border"
            />
            <p className="mt-2 text-sm text-gray-500">
              Esta imagen se mostrará a los clientes cuando soliciten registrar una empresa en planes de pago. Puedes subir tu QR a imgur.com o postimages.org y pegar el enlace directo aquí.
            </p>
          </div>

          {qrUrl && (
            <div className="mt-4 p-4 border rounded-xl bg-gray-50 flex justify-center">
              <img src={qrUrl} alt="Vista Previa QR" className="max-h-64 object-contain rounded-lg shadow-sm" />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
