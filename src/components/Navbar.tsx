import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Wifi, 
  WifiOff, 
  LogOut, 
  UserCircle2, 
  ShieldCheck, 
  ChevronDown,
  Layers,
  Fuel,
  Users,
  Truck,
  BarChart3,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { Role } from '../types';

export const Navbar: React.FC<{
  onOpenLogin: () => void;
}> = ({ onOpenLogin }) => {
  const { currentUser, logout, activeModule, setActiveModule } = useApp();
  const isOnline = useOnlineStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Supervisor':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Surtidor':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Operador':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const navItems = [
    {
      id: 'horometros-entry',
      label: 'Ingreso Horómetros',
      icon: Layers,
      roles: ['Operador', 'Supervisor', 'Administrador'],
    },
    {
      id: 'combustible-entry',
      label: 'Ingreso Combustible',
      icon: Fuel,
      roles: ['Surtidor', 'Supervisor', 'Administrador'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      roles: ['Supervisor', 'Administrador'],
    },
    {
      id: 'equipos',
      label: 'Gestor Equipos',
      icon: Truck,
      roles: ['Supervisor', 'Administrador'],
    },
    {
      id: 'horometros-db',
      label: 'BD Horómetros',
      icon: Database,
      roles: ['Operador', 'Supervisor', 'Administrador'],
    },
    {
      id: 'combustible-db',
      label: 'BD Combustible',
      icon: Fuel,
      roles: ['Surtidor', 'Supervisor', 'Administrador'],
    },
    {
      id: 'users',
      label: 'Gestor Usuarios',
      icon: Users,
      roles: ['Administrador'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Surtidor') {
      return item.id === 'combustible-entry' || item.id === 'combustible-db';
    }
    if (currentUser.role === 'Operador') {
      return item.id === 'horometros-entry' || item.id === 'horometros-db';
    }
    if (currentUser.role === 'Supervisor') {
      return item.id !== 'users';
    }
    return item.roles.includes(currentUser.role);
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black border border-slate-300 p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
            <img 
              src="/assets/aistudio/images__1__2529d5f4.png" 
              alt="Isola Maquinarias" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-['Chakra_Petch',sans-serif]">
                ISOLA <span className="text-amber-600">MAQUINARIAS</span>
              </span>
              <span className="hidden md:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden sm:block">Control de Flota y Operaciones</p>
          </div>
        </div>

        {/* Desktop Quick Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {allowedNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Connectivity, PWA Button, User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Online / Offline status */}
          <div 
            title={isOnline ? 'Conexión en línea' : 'Modo Offline - Datos en caché local'}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* User profile & Fast Role Switcher */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-left transition cursor-pointer shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium border ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Fast Switcher / Profile Dropdown */}
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    >
                      <UserCircle2 className="w-4 h-4 text-slate-500" />
                      <span>Cambiar de cuenta</span>
                    </button>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              Iniciar Sesión
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs text-slate-500">Módulos disponibles ({currentUser?.role || 'Invitado'})</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <PWAInstallButton compact />
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 font-medium hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
