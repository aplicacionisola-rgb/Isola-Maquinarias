import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { safeStorage } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    safeStorage.removeItem('isola_active_user');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Inter',sans-serif] text-slate-800">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Se detectó un inconveniente
            </h1>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              La plataforma ha prevenido un cierre inesperado. Puede recargar la aplicación para continuar trabajando de forma segura.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-100 rounded-xl text-[11px] text-slate-700 font-mono text-left overflow-x-auto max-h-32 border border-slate-200">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar Plataforma</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
