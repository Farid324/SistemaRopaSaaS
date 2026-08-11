'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        router.push('/super-admin/login');
        return;
      }

      const res = await fetch('http://localhost:4000/api/web/superadmin/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('superadmin_token');
        router.push('/super-admin/login');
        return;
      }

      const data = await res.json();
      setEmpresas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const aprobarEmpresa = async (id: string) => {
    if (!confirm('¿Estás seguro de aprobar esta empresa?')) return;
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`http://localhost:4000/api/web/superadmin/empresas/${id}/aprobar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEmpresas();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al aprobar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rechazarEmpresa = async (id: string, accion: 'rechazar' | 'revocar') => {
    const confirmMessage = accion === 'rechazar' 
      ? '¿Estás seguro de RECHAZAR y eliminar esta empresa pendiente?' 
      : '¿Estás seguro de REVOCAR esta empresa activa? Se eliminará todo su inventario.';
    
    if (!confirm(confirmMessage)) return;

    const motivo = prompt('Motivo del rechazo (opcional, se enviará al usuario):') || '';

    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`http://localhost:4000/api/web/superadmin/empresas/${id}/rechazar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });
      if (res.ok) {
        fetchEmpresas();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al rechazar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cambiarPlan = async (id: string, planId: string) => {
    if (!confirm('¿Estás seguro de cambiar el plan a esta empresa?')) {
      fetchEmpresas(); // Reset select
      return;
    }

    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`http://localhost:4000/api/web/superadmin/empresas/${id}/plan`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });
      if (res.ok) {
        fetchEmpresas();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al cambiar plan');
        fetchEmpresas();
      }
    } catch (e) {
      console.error(e);
      fetchEmpresas();
    }
  };

  if (isLoading) return <div className="p-8">Cargando empresas...</div>;

  const pendientes = empresas.filter(e => e.estado === 'PENDIENTE');
  const activas = empresas.filter(e => e.estado === 'ACTIVO');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Solicitudes Pendientes</h1>
        {pendientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No hay solicitudes pendientes.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600">Empresa</th>
                  <th className="p-4 font-semibold text-gray-600">Plan</th>
                  <th className="p-4 font-semibold text-gray-600">Fecha</th>
                  <th className="p-4 font-semibold text-gray-600">Dueño (Correo)</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendientes.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{empresa.nombre}</td>
                    <td className="p-4"><span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold">{empresa.plan?.nombre}</span></td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(empresa.fechaRegistro).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-500 text-sm">{empresa.usuarios?.[0]?.correo || 'Sin dueño'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => aprobarEmpresa(empresa.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => rechazarEmpresa(empresa.id, 'rechazar')}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Empresas Activas</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600">Empresa</th>
                  <th className="p-4 font-semibold text-gray-600">Plan</th>
                  <th className="p-4 font-semibold text-gray-600">Dueño (Correo)</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{empresa.nombre}</td>
                    <td className="p-4">
                      <select 
                        value={empresa.planId} 
                        onChange={(e) => cambiarPlan(empresa.id, e.target.value)}
                        className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold rounded-lg px-2 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="plan-semilla">Plan Semilla (Gratis)</option>
                        <option value="plan-crecimiento">Plan Crecimiento</option>
                        <option value="plan-corporativo">Plan Corporativo</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{empresa.usuarios?.[0]?.correo || 'Sin dueño'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => rechazarEmpresa(empresa.id, 'revocar')}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-red-200"
                      >
                        Revocar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
