import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  Clock, 
  User, 
  Truck, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  X,
  Gauge
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shift } from '../types';
import { compressImageToUnder1MB } from '../utils/imageCompressor';

export const HorometroEntry: React.FC = () => {
  const { currentUser, equipos, addHorometro, setActiveModule } = useApp();

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Shift>('T1');
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>(() => equipos[0]?.id || '');
  const [initialHorometer, setInitialHorometer] = useState<string>('');
  const [finalHorometer, setFinalHorometer] = useState<string>('');
  const [shiftObservation, setShiftObservation] = useState<string>('');
  const [safeEquipmentReport, setSafeEquipmentReport] = useState<string>('');
  
  // Image handling
  const [reportImageData, setReportImageData] = useState<string | null>(null);
  const [imageSizeInfo, setImageSizeInfo] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Submission feedback
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Access guard: Surtidor is strictly restricted from horometros
  if (currentUser?.role === 'Surtidor') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso No Autorizado para Surtidor</h2>
          <p className="text-xs text-slate-500 mb-4">
            El rol de <strong>Surtidor</strong> solo tiene acceso a los módulos de <strong>Ingreso de Combustible</strong> y <strong>Base de Datos de Combustible</strong>.
          </p>
          <button
            onClick={() => setActiveModule('combustible-entry')}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-xs"
          >
            Ir a Ingreso de Combustible
          </button>
        </div>
      </div>
    );
  }

  // Compute calculated hours in real-time
  const numInitial = parseFloat(initialHorometer) || 0;
  const numFinal = parseFloat(finalHorometer) || 0;
  const hasBoth = initialHorometer !== '' && finalHorometer !== '';
  const calculatedHours = hasBoth ? Math.max(0, Number((numFinal - numInitial).toFixed(2))) : 0;
  const isHorometerInverted = hasBoth && numFinal < numInitial;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setCompressing(true);
    try {
      const result = await compressImageToUnder1MB(file);
      setReportImageData(result.dataUrl);
      setImageSizeInfo(`Comprimida a ${result.sizeFormatted} (Límite < 1 MB cumplido)`);
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedEquipoId) {
      setErrorMessage('Por favor seleccione un equipo de la flota.');
      return;
    }

    if (numFinal < numInitial) {
      setErrorMessage('El horómetro final no puede ser menor al horómetro inicial.');
      return;
    }

    const selectedEquipo = equipos.find(eq => eq.id === selectedEquipoId);
    const equipName = selectedEquipo ? selectedEquipo.name : 'Equipo Desconocido';

    setSubmitting(true);
    try {
      await addHorometro({
        date,
        shift,
        operatorName: currentUser?.name || 'Operador en Terreno',
        operatorEmail: currentUser?.email || '',
        operatorId: currentUser?.uid || '',
        equipmentId: selectedEquipoId,
        equipmentName: equipName,
        initialHorometer: numInitial,
        finalHorometer: numFinal,
        shiftObservation,
        safeEquipmentReport,
        reportImageUrl: reportImageData || undefined,
      });

      setSuccessMessage(`¡Registro guardado exitosamente! Horas trabajadas: ${calculatedHours} hrs.`);
      
      setInitialHorometer('');
      setFinalHorometer('');
      setShiftObservation('');
      setSafeEquipmentReport('');
      setReportImageData(null);
      setImageSizeInfo(null);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar el horómetro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              INGRESO DE <span className="text-amber-600">HORÓMETROS</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro diario de jornada de trabajo, horómetros, estado seguro del equipo y evidencia fotográfica
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveModule('horometros-db')}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          Ver Historial y BD
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button 
            onClick={() => setActiveModule('horometros-db')}
            className="text-xs underline font-bold hover:text-emerald-950 ml-4 shrink-0"
          >
            Ir a Base de Datos
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Work Shift & Operator Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 1. Datos de Jornada y Operador
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Operator Name: Auto-obtained from login */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                Nombre Operador (Automático)
              </label>
              <div className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-between">
                <span>{currentUser?.name || 'Operador en Sesión'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                  {currentUser?.role || 'Operador'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Obtenido de la sesión activa del gestor</p>
            </div>

            {/* Manual Date Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Fecha (Ingreso Manual)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
              />
            </div>

            {/* Shift Selector (T1, T2, T3) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Turno
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['T1', 'T2', 'T3'] as Shift[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setShift(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      shift === t
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Equipment & Horometers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4" /> 2. Selección de Equipo y Lectura de Horómetros
          </h2>

          <div className="space-y-4">
            
            {/* Equipment Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Equipo de la Flota (Gestor de Equipos)
              </label>
              <select
                required
                value={selectedEquipoId}
                onChange={(e) => setSelectedEquipoId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition cursor-pointer shadow-xs"
              >
                <option value="" disabled>Seleccione un equipo...</option>
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} — ({eq.type}) [{eq.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Initial, Final and Automatic Hours Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              
              {/* Horómetro Inicial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-600" />
                  Horómetro Inicial (Hrs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="ej: 1450.5"
                  value={initialHorometer}
                  onChange={(e) => setInitialHorometer(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                />
              </div>

              {/* Horómetro Final */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-600" />
                  Horómetro Final (Hrs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="ej: 1458.8"
                  value={finalHorometer}
                  onChange={(e) => setFinalHorometer(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-slate-900 font-mono text-sm focus:outline-none focus:bg-white transition shadow-xs ${
                    isHorometerInverted
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
              </div>

              {/* Cantidad Horas: Automatic Calculation */}
              <div>
                <label className="block text-xs font-semibold text-amber-700 mb-1">
                  Cantidad Horas (Cálculo Automático)
                </label>
                <div className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between font-mono font-bold text-base shadow-xs ${
                  isHorometerInverted
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <span>{calculatedHours.toFixed(1)} hrs</span>
                  <span className="text-[11px] font-normal text-slate-500 font-sans">
                    {isHorometerInverted ? 'Error: Final < Inicial' : 'Final - Inicial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Shift Observations & Safe Equipment Report */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-2">
            <Check className="w-4 h-4" /> 3. Observaciones y Seguridad
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observación del Turno (Texto largo)
            </label>
            <textarea
              rows={3}
              placeholder="Describa tareas realizadas, sector de trabajo, condiciones del terreno, demoras o comentarios operacionales..."
              value={shiftObservation}
              onChange={(e) => setShiftObservation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Reporte Equipo Seguro ARAUCO (Desviaciones detectadas)</span>
              </label>
              
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSafeEquipmentReport('Sin desviaciones detectadas según estándar Equipo Seguro ARAUCO.')}
                  className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold transition cursor-pointer"
                >
                  ✓ Sin Desviaciones ARAUCO
                </button>
                <button
                  type="button"
                  onClick={() => setSafeEquipmentReport('Desviación ARAUCO detectada: ')}
                  className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold transition cursor-pointer"
                >
                  ⚠ Reportar Desviación
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-1.5 leading-tight">
              Este cuadro es exclusivamente para reportar desviaciones, anomalías o no conformidades detectadas en la maquinaria según las exigencias del programa <strong>Equipo Seguro de ARAUCO</strong>.
            </p>

            <textarea
              rows={3}
              placeholder="Describa aquí la desviación detectada según el estándar de Equipo Seguro de ARAUCO (ej: baliza inoperativa, fuga hidráulica, alarma de retroceso con falla, extintor vencido, etc.) o indique 'Sin desviaciones'..."
              value={safeEquipmentReport}
              onChange={(e) => setSafeEquipmentReport(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Section 4: Camera / Gallery Photo Report (Compressed < 1MB) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <Camera className="w-4 h-4" /> 4. Imagen Report (Cámara o Galería)
            </h2>
            <span className="text-[11px] text-slate-500">
              Sin límite de entrada &bull; Comprimida a &lt; 1 MB automáticamente
            </span>
          </div>

          {imageError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs">
              {imageError}
            </div>
          )}

          {reportImageData ? (
            <div className="relative rounded-2xl overflow-hidden border border-amber-300 bg-amber-50/50 p-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-40 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-300 shadow-xs">
                <img 
                  src={reportImageData} 
                  alt="Reporte de equipo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Imagen procesada y optimizada</span>
                </div>
                <p className="text-xs text-amber-900 font-mono font-medium">{imageSizeInfo}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lista para sincronizarse con la base de datos de Isola Maquinarias.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReportImageData(null);
                  setImageSizeInfo(null);
                }}
                className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 transition cursor-pointer"
                title="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Direct Camera Capture on Mobile */}
              <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer text-center group shadow-xs">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Camera className="w-8 h-8 text-amber-600 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-slate-800">Tomar Foto con Cámara</span>
                <span className="text-[10px] text-slate-500 mt-1">Ideal para celulares y tablets en terreno</span>
              </label>

              {/* Option B: Gallery or File Upload */}
              <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 transition cursor-pointer text-center group shadow-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-amber-600 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-slate-800">Subir desde Galería</span>
                <span className="text-[10px] text-slate-500 mt-1">Cualquier tamaño (comprime a &lt; 1MB)</span>
              </label>
            </div>
          )}

          {compressing && (
            <div className="mt-3 text-center text-xs text-amber-700 font-semibold animate-pulse flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              Optimizando y comprimiendo imagen a &lt; 1 MB...
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || compressing || isHorometerInverted}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? 'Guardando en Base de Datos...' : 'Guardar Ingreso de Horómetro'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
