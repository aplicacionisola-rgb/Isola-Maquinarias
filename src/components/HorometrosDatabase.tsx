import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  CheckCircle,
  Truck,
  Layers,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HorometroRecord, Shift } from '../types';
import { exportHorometrosToExcel, exportHorometrosToCSV } from '../utils/exportUtils';

export const HorometrosDatabase: React.FC = () => {
  const { currentUser, horometros, equipos, deleteHorometro, updateHorometro, setActiveModule } = useApp();

  // Filters
  const [filterThisMonth, setFilterThisMonth] = useState<boolean>(true);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [filterEquipo, setFilterEquipo] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<HorometroRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Permission check
  const canEditOrDelete = currentUser && ['Supervisor', 'Administrador'].includes(currentUser.role);

  // Surtidor is restricted from BD Horómetros
  if (currentUser?.role === 'Surtidor') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Database className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso No Autorizado para Surtidor</h2>
          <p className="text-xs text-slate-500 mb-4">
            Como usuario con rol de <strong>Surtidor</strong>, solo tienes acceso a <strong>Ingreso de Combustible</strong> y a la <strong>Base de Datos de Combustible</strong>.
          </p>
          <button
            onClick={() => setActiveModule('combustible-db')}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-xs"
          >
            Ir a BD Combustible
          </button>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredRecords = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return horometros.filter((rec) => {
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
        const matchOperator = rec.operatorName.toLowerCase().includes(q);
        const matchObs = (rec.shiftObservation || '').toLowerCase().includes(q);
        const matchSafety = (rec.safeEquipmentReport || '').toLowerCase().includes(q);
        if (!matchName && !matchOperator && !matchObs && !matchSafety) return false;
      }

      return true;
    });
  }, [horometros, filterThisMonth, dateFrom, dateTo, filterEquipo, filterShift, searchQuery]);

  // Totals
  const totalHoursFiltered = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  }, [filteredRecords]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteHorometro(deletingId);
      setDeletingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await updateHorometro(editingRecord);
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
            <span className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 shadow-xs">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              BASE DE DATOS <span className="text-amber-600">HORÓMETROS</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historial consolidado de registros, reportes técnicos y exportación de planillas
          </p>
        </div>

        {/* Action buttons: Excel, CSV, New Record */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportHorometrosToExcel(filteredRecords)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportHorometrosToCSV(filteredRecords)}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setActiveModule('horometros-entry')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>+ Nuevo Ingreso</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filtros de Búsqueda</span>
          </div>

          {/* "Este Mes" Quick Filter */}
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
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:text-slate-900'
            }`}
          >
            {filterThisMonth ? '✓ Filtro: Este Mes Activado' : 'Filtrar Este Mes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Query */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Buscar por texto</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Equipo, operador, observación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Filtrar por Equipo</label>
            <select
              value={filterEquipo}
              onChange={(e) => setFilterEquipo(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-amber-500"
            >
              <option value="all">Todos los Equipos ({equipos.length})</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-1">Filtrar por Turno</label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-amber-500"
            >
              <option value="all">Todos los Turnos</option>
              <option value="T1">Turno 1 (T1)</option>
              <option value="T2">Turno 2 (T2)</option>
              <option value="T3">Turno 3 (T3)</option>
            </select>
          </div>

          {/* Records count */}
          <div className="flex items-end">
            <div className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-semibold">Registros Encontrados</span>
              <span className="text-sm font-black text-amber-700 font-mono">{filteredRecords.length}</span>
            </div>
          </div>
        </div>

        {/* Custom Date Range Row */}
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

        {/* Summary Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700 font-medium">
          <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-bold">
            Total Horas Filtradas: {totalHoursFiltered.toFixed(1)} hrs
          </div>
          {!canEditOrDelete && (
            <span className="text-[11px] text-slate-500 italic">
              * Rol Operador en modo lectura (la edición/eliminación requiere rol Supervisor o Administrador).
            </span>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700">No se encontraron registros con los filtros actuales</p>
            <p className="text-xs text-slate-400 mt-1">Prueba quitando filtros o realiza un nuevo ingreso de horómetro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha / Turno</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4 text-right">Inicial</th>
                  <th className="py-3 px-4 text-right">Final</th>
                  <th className="py-3 px-4 text-right text-amber-700 font-bold">Horas</th>
                  <th className="py-3 px-4">Evidencia Foto</th>
                  <th className="py-3 px-4">Observaciones</th>
                  {canEditOrDelete && <th className="py-3 px-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{rec.date}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {rec.shift}
                        </span>
                        <span>{rec.registeredAt ? new Date(rec.registeredAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-amber-900">
                      {rec.equipmentName}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {rec.operatorName}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {rec.initialHorometer.toFixed(1)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {rec.finalHorometer.toFixed(1)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-amber-700 text-sm">
                      {rec.totalHours.toFixed(1)} hrs
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.reportImageUrl ? (
                        <button
                          onClick={() => setSelectedImage(rec.reportImageUrl || null)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Ver Foto</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin imagen</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600" title={`${rec.shiftObservation || ''} | ${rec.safeEquipmentReport || ''}`}>
                      {rec.shiftObservation || rec.safeEquipmentReport || '-'}
                    </td>

                    {canEditOrDelete && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRecord({ ...rec })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Editar registro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(rec.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="Eliminar registro"
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

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Evidencia Fotográfica del Turno (Comprimida &lt; 1 MB)</span>
            </h3>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <img src={selectedImage} alt="Evidencia de equipo" className="max-h-[65vh] w-auto object-contain" />
            </div>
            <div className="mt-3 flex justify-end">
              <a 
                href={selectedImage} 
                download="Isola_Evidencia_Reporte.jpg" 
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs"
              >
                Descargar Imagen
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-2">¿Eliminar este registro de horómetro?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Esta acción eliminará el registro de la base de datos de Isola Maquinarias de manera permanente.
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
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative my-8 text-slate-900">
            <button
              onClick={() => setEditingRecord(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>Editar Registro de Horómetro ({editingRecord.equipmentName})</span>
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
                  <label className="block text-slate-700 font-semibold mb-1">Turno</label>
                  <select
                    value={editingRecord.shift}
                    onChange={(e) => setEditingRecord({ ...editingRecord, shift: e.target.value as Shift })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                  >
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horómetro Inicial</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingRecord.initialHorometer}
                    onChange={(e) => {
                      const init = parseFloat(e.target.value) || 0;
                      const fin = editingRecord.finalHorometer || 0;
                      setEditingRecord({ 
                        ...editingRecord, 
                        initialHorometer: init,
                        totalHours: Math.max(0, Number((fin - init).toFixed(2)))
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Horómetro Final</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingRecord.finalHorometer}
                    onChange={(e) => {
                      const fin = parseFloat(e.target.value) || 0;
                      const init = editingRecord.initialHorometer || 0;
                      setEditingRecord({ 
                        ...editingRecord, 
                        finalHorometer: fin,
                        totalHours: Math.max(0, Number((fin - init).toFixed(2)))
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between font-bold text-amber-900">
                <span>Horas calculadas:</span>
                <span className="font-mono text-sm">{editingRecord.totalHours} hrs</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observación del Turno</label>
                <textarea
                  rows={2}
                  value={editingRecord.shiftObservation || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, shiftObservation: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reporte Equipo Seguro ARAUCO (Desviaciones detectadas)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa la desviación detectada según Equipo Seguro ARAUCO o indique 'Sin desviaciones'..."
                  value={editingRecord.safeEquipmentReport || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, safeEquipmentReport: e.target.value })}
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
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
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
