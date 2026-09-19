'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import UserAvatar, { AVATAR_ICONS, ICON_AVATAR_PREFIX, isIconAvatar } from '@/components/UserAvatar';

export default function CuentaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm text-slate-500">
        Cargando...
      </div>
    );
  }

  const currentIcon = isIconAvatar(user.avatar) ? user.avatar!.slice(ICON_AVATAR_PREFIX.length) : null;

  const handleSaveAvatar = async (iconName: string) => {
    setSelectedIcon(iconName);
    setSavingAvatar(true);
    setAvatarSaved(false);
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: `${ICON_AVATAR_PREFIX}${iconName}` }),
      });
      if (res.ok) {
        setAvatarSaved(true);
        setTimeout(() => window.location.reload(), 700);
      }
    } catch {
      // silencioso, no es crítico
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
        return;
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <UserAvatar avatar={user.avatar} name={user.name} className="w-16 h-16 mx-auto" />
          <h1 className="font-serif font-bold text-2xl text-slate-900">Mi Cuenta</h1>
          <p className="text-xs text-slate-500">
            Conectada como <span className="font-semibold">{user.name}</span> ({user.email})
          </p>
        </div>

        <div className="space-y-3 border-b border-slate-100 pb-6">
          <h2 className="text-sm font-bold text-slate-800">Ícono de Perfil</h2>
          <p className="text-xs text-slate-500">Elegí un ícono en vez de una foto para tu avatar.</p>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(AVATAR_ICONS).map(([name, Icon]) => {
              const isActive = (selectedIcon ?? currentIcon) === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSaveAvatar(name)}
                  disabled={savingAvatar}
                  title={name}
                  className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all disabled:opacity-50 ${
                    isActive
                      ? 'border-azul bg-celeste/50 text-azul'
                      : 'border-slate-200 text-slate-500 hover:border-azul/40 hover:text-azul'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
          {avatarSaved && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ícono actualizado.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Cambiar Contraseña</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña actual</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azul"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña nueva</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azul"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Confirmar contraseña nueva</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azul"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Contraseña actualizada correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-azul hover:bg-azul-light text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
          >
            {submitting ? 'Guardando...' : 'Guardar Nueva Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
