import React, { useState } from 'react';
import { 
  Layers, 
  Fuel, 
  BarChart3, 
  Truck, 
  Database, 
  Users, 
  LogOut, 
  UserCircle2,
  ShieldCheck,
  CheckCircle,
  WifiOff
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { HorometroEntry } from './components/HorometroEntry';
import { CombustibleEntry } from './components/CombustibleEntry';
import { HorometrosDatabase } from './components/HorometrosDatabase';
import { CombustibleDatabase } from './components/CombustibleDatabase';
import { EquipoManagement } from './components/EquipoManagement';
import { UserManagement } from './components/UserManagement';
import { Dashboard } from './components/Dashboard';
import { useOnlineStatus } from './hooks/usePWAInstall';

const MainLayout: React.FC = () => {
  const { currentUser, activeModule, setActiveModule } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Navigation modules filtered by current role
  const modules = [
    {
      id: 'horometros-entry',
      label: 'Ingreso Horómetros',
      shortLabel: 'Horómetros',
      icon: Layers,
      roles: ['Operador', 'Supervisor', 'Administrador'],
    },
    {
      id: 'combustible-entry',
      label: 'Ingreso Combustible',
      shortLabel: 'Combustible',
      icon: Fuel,
      roles: ['Surtidor', 'Supervisor', 'Administrador'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: BarChart3,
      roles: ['Supervisor', 'Administrador'],
    },
    {
      id: 'equipos',
      label: 'Gestor Equipos',
      shortLabel: 'Equipos',
      icon: Truck,
      roles: ['Supervisor', 'Administrador'],
    },
    {
      id: 'horometros-db',
      label: 'BD Horómetros',
      shortLabel: 'BD Horóm.',
      icon: Database,
      roles: ['Operador', 'Supervisor', 'Administrador'],
    },
    {
      id: 'combustible-db',
      label: 'BD Combustible',
      shortLabel: 'BD Comb.',
      icon: Fuel,
      roles: ['Surtidor', 'Supervisor', 'Administrador'],
    },
    {
      id: 'users',
      label: 'Gestor Usuarios',
      shortLabel: 'Usuarios',
      icon: Users,
      roles: ['Administrador'],
    },
  ];

  // Strictly filter modules per user role
  const allowedModules = modules.filter((m) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Surtidor') {
      return m.id === 'combustible-entry' || m.id === 'combustible-db';
    }
    if (currentUser.role === 'Operador') {
      return m.id === 'horometros-entry' || m.id === 'horometros-db';
    }
    if (currentUser.role === 'Supervisor') {
      return m.id !== 'users';
    }
    return m.roles.includes(currentUser.role);
  });

  // Guard activeModule so a Surtidor or Operador cannot stay on an unauthorized module
  React.useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Surtidor') {
      if (activeModule !== 'combustible-entry' && activeModule !== 'combustible-db') {
        setActiveModule('combustible-entry');
      }
    } else if (currentUser.role === 'Operador') {
      if (activeModule !== 'horometros-entry' && activeModule !== 'horometros-db') {
        setActiveModule('horometros-entry');
      }
    }
  }, [currentUser?.role, activeModule, setActiveModule]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Inter',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Secondary Subnav Strip for Fast Desktop Navigation */}
      <div className="hidden md:block bg-white/95 border-b border-slate-200 sticky top-16 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2">
          {allowedModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-900 border border-amber-400/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-10 bg-slate-50">
        {currentUser?.role === 'Surtidor' ? (
          activeModule === 'combustible-db' ? <CombustibleDatabase /> : <CombustibleEntry />
        ) : (
          <>
            {activeModule === 'horometros-entry' && <HorometroEntry />}
            {activeModule === 'combustible-entry' && <CombustibleEntry />}
            {activeModule === 'horometros-db' && <HorometrosDatabase />}
            {activeModule === 'combustible-db' && <CombustibleDatabase />}
            {activeModule === 'equipos' && <EquipoManagement />}
            {activeModule === 'users' && <UserManagement />}
            {activeModule === 'dashboard' && <Dashboard />}
          </>
        )}
      </main>

      {/* Offline Toast Banner if device disconnects */}
      {!isOnline && (
        <div className="fixed bottom-18 left-4 z-50 flex items-center gap-2 bg-amber-600 text-white px-3.5 py-2 rounded-xl shadow-xl text-xs font-medium border border-amber-500">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Modo Offline activado — Las lecturas se guardan localmente</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (PWA friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg">
        {allowedModules.slice(0, 4).map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{mod.shortLabel}</span>
            </button>
          );
        })}
        {allowedModules.length > 4 && (
          <button
            onClick={() => {
              const remaining = allowedModules.slice(4);
              const nextMod = remaining.find(m => m.id === activeModule) ? allowedModules[0] : remaining[0];
              setActiveModule(nextMod.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
              allowedModules.slice(4).some(m => m.id === activeModule)
                ? 'text-amber-600 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Más</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Isola Maquinarias</span>
            <span>&bull;</span>
            <span>PWA Instalable con Firebase Firestore</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Operador: <strong className="text-slate-700">{currentUser?.name}</strong></span>
            <span>({currentUser?.role})</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
