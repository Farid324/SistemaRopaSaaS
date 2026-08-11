'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        router.push('/super-admin/login');
        return;
      }

      const res = await fetch('http://localhost:4000/api/web/superadmin/clientes', {
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
      setClientes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    if (!confirm(`¿Estás seguro de cambiar el estado de este usuario a ${nuevoEstado}?`)) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`http://localhost:4000/api/web/superadmin/clientes/${id}/estado`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        fetchClientes();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al actualizar estado');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarCliente = async (id: string) => {
    if (!confirm('¿Estás seguro de ELIMINAR permanentemente esta cuenta?')) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`http://localhost:4000/api/web/superadmin/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchClientes();
      } else {
        const err = await res.json();
        alert(err.message || 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="p-8">Cargando clientes...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Clientes (B2C)</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Correo</th>
                <th className="p-4 font-semibold text-gray-600">Rol / Empresa</th>
                <th className="p-4 font-semibold text-gray-600">Registro</th>
                <th className="p-4 font-semibold text-gray-600">Estado</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No hay clientes registrados.</td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      {cliente.nombreCompleto}
                      {cliente.googleId && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Google</span>}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{cliente.correo}</td>
                    <td className="p-4">
                      {cliente.rol === 'CLIENTE' ? (
                        <span className="text-gray-500 text-sm">Sin empresa</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded w-fit mb-1">{cliente.rol}</span>
                          <span className="text-xs font-semibold text-gray-700">{cliente.empresa?.nombre || 'Pendiente'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(cliente.fechaIngreso).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        cliente.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => cambiarEstado(cliente.id, cliente.estado)}
                        className={`${cliente.estado === 'ACTIVO' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors`}
                      >
                        {cliente.estado === 'ACTIVO' ? 'Bloquear' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => eliminarCliente(cliente.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
