import * as XLSX from 'xlsx';
import { HorometroRecord, CombustibleRecord } from '../types';

export function exportHorometrosToExcel(records: HorometroRecord[], filename = 'Isola_Horometros_Historial') {
  const data = records.map((r, index) => ({
    'N°': index + 1,
    'Fecha de Registro': r.registeredAt ? new Date(r.registeredAt).toLocaleString('es-CL') : '-',
    'Fecha': r.date,
    'Turno': r.shift,
    'Operador': r.operatorName,
    'Equipo': r.equipmentName,
    'Horómetro Inicial': r.initialHorometer,
    'Horómetro Final': r.finalHorometer,
    'Cantidad de Horas': r.totalHours,
    'Observación del Turno': r.shiftObservation || '-',
    'Reporte Equipo Seguro ARAUCO (Desviaciones)': r.safeEquipmentReport || '-',
    'Tiene Imagen': r.reportImageUrl ? 'Sí' : 'No',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Horometros');
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportHorometrosToCSV(records: HorometroRecord[], filename = 'Isola_Horometros_Historial') {
  const headers = ['N°', 'Fecha_Registro', 'Fecha', 'Turno', 'Operador', 'Equipo', 'Horometro_Inicial', 'Horometro_Final', 'Cantidad_Horas', 'Observacion', 'Reporte_Equipo_Seguro_ARAUCO'];
  const rows = records.map((r, i) => [
    i + 1,
    `"${r.registeredAt ? new Date(r.registeredAt).toLocaleString('es-CL') : '-'}"`,
    `"${r.date}"`,
    `"${r.shift}"`,
    `"${r.operatorName.replace(/"/g, '""')}"`,
    `"${r.equipmentName.replace(/"/g, '""')}"`,
    r.initialHorometer,
    r.finalHorometer,
    r.totalHours,
    `"${(r.shiftObservation || '').replace(/"/g, '""')}"`,
    `"${(r.safeEquipmentReport || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCombustibleToExcel(records: CombustibleRecord[], filename = 'Isola_Combustible_Historial') {
  const data = records.map((r, index) => ({
    'N°': index + 1,
    'Fecha de Registro': r.registeredAt ? new Date(r.registeredAt).toLocaleString('es-CL') : '-',
    'Fecha Carga': r.date,
    'Litros Cargados': r.fuelLiters,
    'Equipo': r.equipmentName,
    'Turno': r.shift || '-',
    'Registrado Por': r.recordedByName,
    'Observación': r.shiftObservation || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Combustible');
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportCombustibleToCSV(records: CombustibleRecord[], filename = 'Isola_Combustible_Historial') {
  const headers = ['N°', 'Fecha_Registro', 'Fecha_Carga', 'Litros_Cargados', 'Equipo', 'Turno', 'Registrado_Por', 'Observacion'];
  const rows = records.map((r, i) => [
    i + 1,
    `"${r.registeredAt ? new Date(r.registeredAt).toLocaleString('es-CL') : '-'}"`,
    `"${r.date}"`,
    r.fuelLiters,
    `"${r.equipmentName.replace(/"/g, '""')}"`,
    `"${r.shift || '-'}"`,
    `"${r.recordedByName.replace(/"/g, '""')}"`,
    `"${(r.shiftObservation || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
