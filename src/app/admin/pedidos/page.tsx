'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import { Order } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.recentOrders) setOrders(data.recentOrders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-3">
        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-slate-800">Acceso restringido</h2>
        <p className="text-xs text-slate-500">
          Solo el rol Administrador puede ver las transacciones de Mercado Pago.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Transacciones y Cobros (Mercado Pago)
          </h2>
          <p className="text-xs text-slate-500">
            Registro de inscripciones abonadas mediante tarjetas, cuotas o saldo en cuenta.
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Acreditado:</span>
          <strong className="text-lg font-bold text-emerald-600">
            ${totalRevenue.toLocaleString('es-AR')} ARS
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando transacciones...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
          No hay órdenes registradas aún.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">ID Orden</th>
                  <th className="p-4">Curso</th>
                  <th className="p-4">Alumno/a / Email</th>
                  <th className="p-4">Importe</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-400">{ord.id}</td>
                    <td className="p-4 font-semibold text-slate-800">{ord.courseTitle}</td>
                    <td className="p-4 text-slate-600">{ord.userEmail}</td>
                    <td className="p-4 font-bold text-slate-900">
                      ${ord.amount.toLocaleString('es-AR')} ARS
                    </td>
                    <td className="p-4">
                      {ord.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10px]">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
