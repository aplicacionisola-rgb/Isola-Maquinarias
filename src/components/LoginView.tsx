import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  LogIn, 
  Eye, 
  EyeOff, 
  Wifi, 
  WifiOff, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const LoginView: React.FC = () => {
  const { loginWithEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isOnline = useOnlineStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al verificar credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-['Inter',sans-serif]">
      
      {/* Top Header with Connectivity & PWA Install */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black border border-slate-300 p-1 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="/assets/aistudio/images__1__2529d5f4.png" 
              alt="Isola Maquinarias" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-['Chakra_Petch',sans-serif] block leading-tight">
              ISOLA <span className="text-amber-600">MAQUINARIAS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
              Sistema de Flota y Operaciones
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div 
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
            <span className="hidden sm:inline">{isOnline ? 'En línea' : 'Sin conexión'}</span>
          </div>
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl relative text-slate-900">
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-black border border-slate-300 p-2 shadow-sm mb-3.5 flex items-center justify-center">
              <img 
                src="/assets/aistudio/images__1__2529d5f4.png" 
                alt="Isola Maquinarias" 
                className="w-full h-full object-contain" 
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif] tracking-wide">
              ISOLA <span className="text-amber-600">MAQUINARIAS</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Ingrese con sus credenciales autorizadas para acceder a los módulos de operaciones
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Registered User Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verificando...' : 'Ingresar a la Plataforma'}</span>
            </button>
          </form>

          {/* Security & Access Information */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2.5 text-slate-500 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Acceso exclusivo para personal registrado. Si no posee usuario o requiere recuperar su clave, contacte al Administrador en el Gestor de Usuarios.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>Isola Maquinarias &bull; Control de Flota y Horómetros &bull; PWA</p>
      </footer>
    </div>
  );
};
