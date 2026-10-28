export type Role = 'Administrador' | 'Supervisor' | 'Surtidor' | 'Operador';

export type Shift = 'T1' | 'T2' | 'T3';

export type EquipmentStatus = 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio';

export type EquipmentType = 'Grúa' | 'Cargador Frontal' | 'Camión' | 'Furgón' | 'Excavadora' | 'Retroexcavadora' | 'Otro';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipo {
  id: string;
  code: string;
  brand: string; // e.g. Liebherr, Volvo, JAC, Hyundai
  type: EquipmentType;
  name: string; // Auto-generated: code + brand
  status: EquipmentStatus;
  createdAt?: string;
}

export interface HorometroRecord {
  id: string;
  registeredAt: string; // Auto-registered system timestamp (hidden in UI)
  date: string; // Manual date entered (YYYY-MM-DD)
  shift: Shift; // T1, T2, T3
  operatorName: string; // from login
  operatorEmail?: string;
  operatorId?: string;
  equipmentId: string;
  equipmentName: string;
  initialHorometer: number;
  finalHorometer: number;
  totalHours: number; // final - initial
  shiftObservation: string;
  safeEquipmentReport: string;
  reportImageUrl?: string; // base64 compressed to < 1MB
  createdAt?: string;
}

export interface CombustibleRecord {
  id: string;
  registeredAt: string; // Auto-registered system timestamp (hidden in UI)
  date: string; // Manual date entered (YYYY-MM-DD)
  fuelLiters: number;
  equipmentId: string;
  equipmentName: string;
  shiftObservation: string;
  shift?: Shift;
  recordedByName: string;
  recordedByEmail: string;
  recordedById?: string;
  createdAt?: string;
}
