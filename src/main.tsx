import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Fatal mounting error in main.tsx:', error);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 16px;">
        <div style="max-width: 400px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">Isola Maquinarias</h2>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Inconveniente al cargar la plataforma. Presione el botón para reiniciar la sesión.</p>
          <button onclick="localStorage.clear(); window.location.reload();" style="width: 100%; padding: 10px 16px; background: #f59e0b; color: #0f172a; font-weight: bold; font-size: 13px; border: none; border-radius: 10px; cursor: pointer;">
            Reiniciar Aplicación
          </button>
        </div>
      </div>
    `;
  }
}
