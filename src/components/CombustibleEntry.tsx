import React, { useState } from 'react';
import { 
  Fuel, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  User,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shift } from '../types';

export const CombustibleEntry: React.FC = () => {
  const { currentUser, equipos, addCombustible, setActiveModule } = useApp();

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [fuelLiters, setFuelLiters] = useState<string>('');
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>(() => equipos[0]?.id || '');
  const [shift, setShift] = useState<Shift>('T1');
  const [shiftObservation, setShiftObservation] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guard access: only Surtidor, Supervisor, Administrador
  const canAccess = currentUser && ['Surtidor', 'Supervisor', 'Administrador'].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Fuel className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso Restringido a Combustible</h2>
          <p className="text-xs text-slate-500 mb-4">
            Este módulo requiere el rol de <strong>Surtidor</strong>, <strong>Supervisor</strong> o <strong>Administrador</strong>.
          </p>
          <button
            onClick={() => setActiveModule('horometros-entry')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            Ir a Ingreso de Horómetros
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const liters = parseFloat(fuelLiters);
    if (!liters || liters <= 0) {
      setErrorMessage('Por favor ingrese una cantidad válida de litros cargados.');
      return;
    }

    if (!selectedEquipoId) {
      setErrorMessage('Por favor seleccione un equipo de la flota.');
      return;
    }

    const selectedEquipo = equipos.find(eq => eq.id === selectedEquipoId);
    const equipName = selectedEquipo ? selectedEquipo.name : 'Equipo Desconocido';

    setSubmitting(true);
    try {
      await addCombustible({
        date,
        fuelLiters: liters,
        equipmentId: selectedEquipoId,
        equipmentName: equipName,
        shiftObservation,
        shift,
        recordedByName: currentUser?.name || 'Surtidor Isola',
        recordedByEmail: currentUser?.email || '',
        recordedById: currentUser?.uid || '',
      });

      setSuccessMessage(`¡Carga de ${liters} L registrada exitosamente para ${equipName}!`);
      setFuelLiters('');
      setShiftObservation('');

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al registrar el combustible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-100 border border-cyan-300 text-cyan-800 shadow-xs">
              <Fuel className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              INGRESO DE <span className="text-cyan-700">COMBUSTIBLE</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Abastecimiento de diésel y gasolina para maquinarias y vehículos de la flota
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveModule('combustible-db')}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          Ver Historial Cargas
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button 
            onClick={() => setActiveModule('combustible-db')}
            className="text-xs underline font-bold hover:text-emerald-950 ml-4 shrink-0"
          >
            Ir a BD Combustible
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Info panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Surtidor identity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" />
                Registrado Por (Surtidor / Encargado)
              </label>
              <div className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-between">
                <span>{currentUser?.name || 'Surtidor'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-mono">
                  {currentUser?.role}
                </span>
              </div>
            </div>

            {/* Manual Date input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                Fecha (Ingreso Manual)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-xs"
              />
            </div>
          </div>

          {/* Equipment selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-600" />
              Equipo Abastecido (Gestor de Equipos)
            </label>
            <select
              required
              value={selectedEquipoId}
              onChange={(e) => setSelectedEquipoId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition cursor-pointer shadow-xs"
            >
              <option value="" disabled>Seleccione equipo a cargar...</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} — ({eq.type}) [{eq.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Liters input */}
            <div>
              <label className="block text-xs font-semibold text-cyan-800 mb-1 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5" />
                Cantidad de Litros (Ingreso Manual)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  placeholder="ej: 180"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  className="w-full px-3 py-2.5 pr-12 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base font-bold focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                  LTS
                </span>
              </div>
            </div>

            {/* Turno */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                Turno de Carga
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['T1', 'T2', 'T3'] as Shift[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setShift(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      shift === t
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observación del turno */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observación del Turno (Texto largo)
            </label>
            <textarea
              rows={3}
              placeholder="Número de factura o vale, surtidor móvil utilizado, precinto, nivel de tanque previo/posterior..."
              value={shiftObservation}
              onChange={(e) => setShiftObservation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-cyan-600/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{submitting ? 'Guardando Registro...' : 'Registrar Carga de Combustible'}</span>
        </button>
      </form>
    </div>
  );
};
