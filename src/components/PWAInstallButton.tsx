import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone mode, show subtle verified badge or hide
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>PWA Instalada</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar aplicación en tu dispositivo"
        className={`flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
          compact
            ? 'px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold'
            : 'px-3.5 py-1.5 text-xs rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 text-slate-950 font-bold tracking-wide'
        }`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instalar App</span>
      </button>

      {/* Guide Modal for iOS or manual install */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-black border border-slate-300 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                <img src="/assets/aistudio/images__1__2529d5f4.png" alt="Isola Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Instalar Isola Maquinarias</span>
                </h3>
                <p className="text-xs text-amber-700 font-semibold">Progressive Web App (PWA)</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Instala la aplicación en tu pantalla de inicio para acceder rápidamente desde terreno, trabajar sin barra de navegación y con soporte offline.
            </p>

            {isIOS ? (
              <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 text-sm">
                <p className="font-bold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Pasos para iPhone / iPad (Safari):
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-amber-300">1</div>
                  <p className="text-slate-700 text-xs">
                    Toca el botón <strong>Compartir</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />) en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-amber-300">2</div>
                  <p className="text-slate-700 text-xs">
                    Desplázate hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" />).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-amber-300">3</div>
                  <p className="text-slate-700 text-xs">
                    Toca <strong>Agregar</strong> en la esquina superior derecha. ¡Listo!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 text-sm">
                <p className="font-bold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> En Android / Chrome / Edge:
                </p>
                <p className="text-xs text-slate-700 leading-normal">
                  1. Toca el menú de tres puntos (⋮) en la esquina superior derecha del navegador.<br />
                  2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.<br />
                  3. Confirma la instalación.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition border border-slate-300 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Installed Toast Notification */}
      {installSuccess && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-100" />
          <div className="text-xs">
            <p className="font-bold">¡App instalada con éxito!</p>
            <p className="text-emerald-100">Ahora puedes abrirla directamente desde tu pantalla de inicio.</p>
          </div>
        </div>
      )}
    </>
  );
};
