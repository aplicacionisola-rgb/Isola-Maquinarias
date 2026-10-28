import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Fuel, 
  Truck, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const { currentUser, horometros, combustible, equipos, setActiveModule } = useApp();

  const canAccess = currentUser && ['Supervisor', 'Administrador'].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso Restringido al Dashboard</h2>
          <p className="text-xs text-slate-500 mb-4">
            El panel estadístico de operaciones está disponible exclusivamente para <strong>Supervisor</strong> y <strong>Administrador</strong>.
          </p>
          <button
            onClick={() => setActiveModule('horometros-entry')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Ir a Ingreso de Horómetros
          </button>
        </div>
      </div>
    );
  }

  // Current month stats
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const thisMonthHoros = useMemo(() => {
    return horometros.filter(h => {
      const d = new Date(h.date + 'T00:00:00');
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [horometros, currentYear, currentMonth]);

  const thisMonthComb = useMemo(() => {
    return combustible.filter(c => {
      const d = new Date(c.date + 'T00:00:00');
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [combustible, currentYear, currentMonth]);

  const totalHoursMonth = useMemo(() => {
    return thisMonthHoros.reduce((acc, h) => acc + (h.totalHours || 0), 0);
  }, [thisMonthHoros]);

  const totalFuelMonth = useMemo(() => {
    return thisMonthComb.reduce((acc, c) => acc + (c.fuelLiters || 0), 0);
  }, [thisMonthComb]);

  const totalHoursAllTime = useMemo(() => {
    return horometros.reduce((acc, h) => acc + (h.totalHours || 0), 0);
  }, [horometros]);

  const totalFuelAllTime = useMemo(() => {
    return combustible.reduce((acc, c) => acc + (c.fuelLiters || 0), 0);
  }, [combustible]);

  // Ratio
  const fuelPerHour = totalHoursMonth > 0 ? (totalFuelMonth / totalHoursMonth).toFixed(1) : '0';

  // Ranking: Equipos con más horas trabajadas
  const equipmentHoursRanking = useMemo(() => {
    const map = new Map<string, { name: string; hours: number; count: number }>();
    horometros.forEach(h => {
      const current = map.get(h.equipmentName) || { name: h.equipmentName, hours: 0, count: 0 };
      current.hours += h.totalHours || 0;
      current.count += 1;
      map.set(h.equipmentName, current);
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.hours - a.hours);
    return list;
  }, [horometros]);

  const maxWorkedHours = equipmentHoursRanking[0]?.hours || 1;

  // Fuel consumption per equipment
  const equipmentFuelRanking = useMemo(() => {
    const map = new Map<string, { name: string; liters: number; loads: number }>();
    combustible.forEach(c => {
      const current = map.get(c.equipmentName) || { name: c.equipmentName, liters: 0, loads: 0 };
      current.liters += c.fuelLiters || 0;
      current.loads += 1;
      map.set(c.equipmentName, current);
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.liters - a.liters);
    return list;
  }, [combustible]);

  const maxFuelLiters = equipmentFuelRanking[0]?.liters || 1;

  // Breakdown by Shift (T1, T2, T3)
  const shiftHours = useMemo(() => {
    const res = { T1: 0, T2: 0, T3: 0 };
    horometros.forEach(h => {
      if (h.shift && res[h.shift] !== undefined) {
        res[h.shift] += h.totalHours || 0;
      }
    });
    return res;
  }, [horometros]);

  // Operational status breakdown
  const fleetStatus = useMemo(() => {
    const op = equipos.filter(e => e.status === 'Operativo').length;
    const mant = equipos.filter(e => e.status === 'En Mantenimiento').length;
    const out = equipos.filter(e => e.status === 'Fuera de Servicio').length;
    const total = equipos.length || 1;
    return {
      operativo: op,
      mantenimiento: mant,
      fuera: out,
      percentOp: Math.round((op / total) * 100),
    };
  }, [equipos]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              DASHBOARD <span className="text-amber-600">EJECUTIVO</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Estadísticas de flota, horas trabajadas, consumo de combustible e indicadores clave
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Mes Actual: {new Date().toLocaleString('es-CL', { month: 'long', year: 'numeric' })}</span>
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Horas Trabajadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Horas Trabajadas (Mes)</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {totalHoursMonth.toFixed(1)} <span className="text-xs font-normal text-amber-700">hrs</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Acumulado total: {totalHoursAllTime.toFixed(1)} hrs
            </span>
          </div>
        </div>

        {/* KPI 2: Consumo de Combustible */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-300 text-cyan-800 flex items-center justify-center shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Combustible Cargado (Mes)</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {totalFuelMonth.toLocaleString('es-CL')} <span className="text-xs font-normal text-cyan-700">Lts</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Acumulado total: {totalFuelAllTime.toLocaleString('es-CL')} Lts
            </span>
          </div>
        </div>

        {/* KPI 3: Rendimiento Promedio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Consumo Promedio</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {fuelPerHour} <span className="text-xs font-normal text-indigo-700">L / hr</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Eficiencia de la flota activa
            </span>
          </div>
        </div>

        {/* KPI 4: Disponibilidad Flota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Disponibilidad Flota</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {fleetStatus.percentOp}%
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-medium">
              {fleetStatus.operativo} de {equipos.length} operativos
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Equipos con más Horas Trabajadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Equipos con Más Horas Trabajadas</span>
            </h2>
            <button
              onClick={() => setActiveModule('horometros-db')}
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Ver Base de Datos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {equipmentHoursRanking.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay registros de horómetros aún.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {equipmentHoursRanking.slice(0, 6).map((item, index) => {
                const percent = Math.min(100, Math.round((item.hours / maxWorkedHours) * 100));
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-800">
                        {item.hours.toFixed(1)} hrs ({item.count} turnos)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Module 2: Consumo de Combustibles por Equipo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-cyan-600" />
              <span>Consumo de Combustible por Equipo</span>
            </h2>
            <button
              onClick={() => setActiveModule('combustible-db')}
              className="text-xs text-cyan-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Ver Base de Datos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {equipmentFuelRanking.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay registros de combustible aún.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {equipmentFuelRanking.slice(0, 6).map((item, index) => {
                const percent = Math.min(100, Math.round((item.liters / maxFuelLiters) * 100));
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-800">
                        {item.liters.toLocaleString('es-CL')} Lts ({item.loads} cargas)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Shifts & Fleet Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Turnos Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Distribución por Turnos</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">Turno 1 (T1)</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                {shiftHours.T1.toFixed(1)} <span className="text-[10px] font-normal text-amber-700">h</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">Turno 2 (T2)</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                {shiftHours.T2.toFixed(1)} <span className="text-[10px] font-normal text-amber-700">h</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">Turno 3 (T3)</span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                {shiftHours.T3.toFixed(1)} <span className="text-[10px] font-normal text-amber-700">h</span>
              </span>
            </div>
          </div>
        </div>

        {/* Fleet Composition */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Estado Operacional de la Maquinaria</span>
            </h3>
            <button
              onClick={() => setActiveModule('equipos')}
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Gestionar Flota</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">Operativos</span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">{fleetStatus.operativo} máquinas</p>
              <span className="text-[10px] text-slate-500">Listas para asignación</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800">En Mantenimiento</span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">{fleetStatus.mantenimiento} máquinas</p>
              <span className="text-[10px] text-slate-500">Preventivo / Correctivo</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-bold text-rose-800">Fuera de Servicio</span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">{fleetStatus.fuera} máquinas</p>
              <span className="text-[10px] text-slate-500">Requiere inspección mayor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
