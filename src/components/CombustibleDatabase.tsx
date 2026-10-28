import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  X, 
  Truck,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CombustibleRecord, Shift } from '../types';
import { exportCombustibleToExcel, exportCombustibleToCSV } from '../utils/exportUtils';

export const CombustibleDatabase: React.FC = () => {
  const { currentUser, combustible, equipos, deleteCombustible, updateCombustible, setActiveModule } = useApp();

  const [filterThisMonth, setFilterThisMonth] = useState<boolean>(true);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [filterEquipo, setFilterEquipo] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [editingRecord, setEditingRecord] = useState<CombustibleRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEditOrDelete = currentUser && ['Supervisor', 'Administrador'].includes(currentUser.role);
  const canAccess = currentUser && ['Surtidor', 'Supervisor', 'Administrador'].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Fuel className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso Restringido</h2>
          <p className="text-xs text-slate-500 mb-4">
            La base de datos de combustible está reservada para roles de Surtidor, Supervisor y Administrador.
          </p>
          <button
            onClick={() => setActiveModule('horometros-entry')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Volver a Horómetros
          </button>
        </div>
      </div>
    );
  }

  const filteredRecords = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return combustible.filter((rec) => {
      // 1. "Este mes" filter
      if (filterThisMonth) {
        const recordDate = new Date(rec.date + 'T00:00:00');
        if (recordDate.getFullYear() !== currentYear || recordDate.getMonth() !== currentMonth) {
          return false;
        }
      }

      // 2. Custom date range
      if (dateFrom && rec.date < dateFrom) return false;
      if (dateTo && rec.date > dateTo) return false;

      // 3. Equipment filter
      if (filterEquipo !== 'all' && rec.equipmentId !== filterEquipo && rec.equipmentName !== filterEquipo) {
        return false;
      }

      // 4. Shift filter
      if (filterShift !== 'all' && rec.shift !== filterShift) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.equipmentName.toLowerCase().includes(q);
        const matchRecorder = rec.recordedByName.toLowerCase().includes(q);
        const matchObs = (rec.shiftObservation || '').toLowerCase().includes(q);
        if (!matchName && !matchRecorder && !matchObs) return false;
      }

      return true;
    });
  }, [combustible, filterThisMonth, dateFrom, dateTo, filterEquipo, filterShift, searchQuery]);

  // Total Liters
  const totalLitersFiltered = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + (curr.fuelLiters || 0), 0);
  }, [filteredRecords]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteCombustible(deletingId);
      setDeletingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await updateCombustible(editingRecord);
      setEditingRecord(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-100 border border-cyan-300 text-cyan-800 shadow-xs">
              <Fuel className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              BASE DE DATOS <span className="text-cyan-700">COMBUSTIBLE</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro de abastecimiento de diésel por máquina, turno y exportación de planillas
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportCombustibleToExcel(filteredRecords)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportCombustibleToCSV(filteredRecords)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setActiveModule('combustible-entry')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Carga</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filtros de Búsqueda</span>
          </div>

          <button
            onClick={() => {
              setFilterThisMonth(!filterThisMonth);
              if (!filterThisMonth) {
                setDateFrom('');
                setDateTo('');
              }
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
              filterThisMonth
                ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:text-slate-900'
            }`}
          >
            {filterThisMonth ? '✓ Filtro: Este Mes Activado' : 'Filtrar Este Mes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="lg:col-span-2">
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Buscar por texto</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Equipo, surtidor, observación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Filtrar por Equipo</label>
            <select
              value={filterEquipo}
              onChange={(e) => setFilterEquipo(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-cyan-500"
            >
              <option value="all">Todos los Equipos</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Filtrar por Turno</label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-cyan-500"
            >
              <option value="all">Todos los Turnos</option>
              <option value="T1">Turno 1 (T1)</option>
              <option value="T2">Turno 2 (T2)</option>
              <option value="T3">Turno 3 (T3)</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-semibold">Cargas Encontradas</span>
              <span className="text-sm font-black text-cyan-700 font-mono">{filteredRecords.length}</span>
            </div>
          </div>
        </div>

        {!filterThisMonth && (
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">Desde Fecha:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">Hasta Fecha:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold text-xs font-mono">
            Total Litros Cargados: {totalLitersFiltered.toLocaleString('es-CL')} Lts
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Fuel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700">No se encontraron cargas de combustible registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha Carga</th>
                  <th className="py-3 px-4">Equipo Abastecido</th>
                  <th className="py-3 px-4 text-right text-cyan-800 font-bold">Litros (L)</th>
                  <th className="py-3 px-4">Turno</th>
                  <th className="py-3 px-4">Registrado Por</th>
                  <th className="py-3 px-4">Observación</th>
                  {canEditOrDelete && <th className="py-3 px-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{rec.date}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {rec.registeredAt ? new Date(rec.registeredAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800">
                      {rec.equipmentName}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-cyan-700 text-sm whitespace-nowrap">
                      {rec.fuelLiters.toLocaleString('es-CL')} Lts
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-bold">
                        {rec.shift || 'T1'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {rec.recordedByName}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600" title={rec.shiftObservation}>
                      {rec.shiftObservation || '-'}
                    </td>

                    {canEditOrDelete && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRecord({ ...rec })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Editar carga"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(rec.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="Eliminar carga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-2">¿Eliminar registro de combustible?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Esta acción no se puede deshacer. Se descontará del historial de consumo.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setEditingRecord(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-600" />
              <span>Editar Registro de Combustible</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Litros</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingRecord.fuelLiters}
                    onChange={(e) => setEditingRecord({ ...editingRecord, fuelLiters: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Turno</label>
                <select
                  value={editingRecord.shift || 'T1'}
                  onChange={(e) => setEditingRecord({ ...editingRecord, shift: e.target.value as Shift })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                >
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observación</label>
                <textarea
                  rows={3}
                  value={editingRecord.shiftObservation || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, shiftObservation: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
