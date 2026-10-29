import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection 
} from '../lib/firebase';
import { 
  UserProfile, 
  Equipo, 
  HorometroRecord, 
  CombustibleRecord, 
  Role 
} from '../types';

// Default initial users
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-01',
    email: 'admin@isola.com',
    name: 'Carlos Mendoza',
    role: 'Administrador',
    password: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'super-01',
    email: 'supervisor@isola.com',
    name: 'Rodrigo Alarcón',
    role: 'Supervisor',
    password: 'super',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'surti-01',
    email: 'surtidor@isola.com',
    name: 'Marcos Benítez',
    role: 'Surtidor',
    password: 'surti',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'opera-01',
    email: 'operador@isola.com',
    name: 'Esteban Valdés',
    role: 'Operador',
    password: 'opera',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'admin-gcp',
    email: 'aplicacionisola@gmail.com',
    name: 'Isola Admin Master',
    role: 'Administrador',
    password: 'admin',
    createdAt: new Date().toISOString(),
  }
];

// Initial equipment fleet
const INITIAL_EQUIPOS: Equipo[] = [
  {
    id: 'eq-1',
    code: 'GR-101',
    brand: 'Liebherr',
    type: 'Grúa',
    name: 'GR-101 - Liebherr',
    status: 'Operativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'eq-2',
    code: 'CF-205',
    brand: 'Volvo',
    type: 'Cargador Frontal',
    name: 'CF-205 - Volvo',
    status: 'Operativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'eq-3',
    code: 'CM-310',
    brand: 'JAC',
    type: 'Camión',
    name: 'CM-310 - JAC',
    status: 'Operativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'eq-4',
    code: 'FG-402',
    brand: 'Hyundai',
    type: 'Furgón',
    name: 'FG-402 - Hyundai',
    status: 'Operativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'eq-5',
    code: 'GR-108',
    brand: 'Liebherr',
    type: 'Grúa',
    name: 'GR-108 - Liebherr',
    status: 'En Mantenimiento',
    createdAt: new Date().toISOString(),
  }
];

// Initial seed horometers
const INITIAL_HOROMETROS: HorometroRecord[] = [
  {
    id: 'horo-1',
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    date: new Date().toISOString().split('T')[0],
    shift: 'T1',
    operatorName: 'Esteban Valdés',
    operatorEmail: 'operador@isola.com',
    operatorId: 'opera-01',
    equipmentId: 'eq-2',
    equipmentName: 'CF-205 - Volvo',
    initialHorometer: 4520.5,
    finalHorometer: 4528.2,
    totalHours: 7.7,
    shiftObservation: 'Operación continua en acopio principal. Niveles de refrigerante y aceite normales.',
    safeEquipmentReport: 'Inspección de 360° conforme. Alarma de retroceso y luces de trabajo operativas.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'horo-2',
    registeredAt: new Date(Date.now() - 86400000).toISOString(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    shift: 'T2',
    operatorName: 'Esteban Valdés',
    operatorEmail: 'operador@isola.com',
    operatorId: 'opera-01',
    equipmentId: 'eq-1',
    equipmentName: 'GR-101 - Liebherr',
    initialHorometer: 1890.0,
    finalHorometer: 1898.5,
    totalHours: 8.5,
    shiftObservation: 'Izajes en sector norte sin novedades climáticas ni técnicas.',
    safeEquipmentReport: 'Frenos de giro y limitadores de carga comprobados sin observaciones.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Initial seed fuel records
const INITIAL_COMBUSTIBLE: CombustibleRecord[] = [
  {
    id: 'comb-1',
    registeredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    date: new Date().toISOString().split('T')[0],
    fuelLiters: 180,
    equipmentId: 'eq-2',
    equipmentName: 'CF-205 - Volvo',
    shift: 'T1',
    shiftObservation: 'Carga de diésel completa al término de jornada mañana.',
    recordedByName: 'Marcos Benítez',
    recordedByEmail: 'surtidor@isola.com',
    recordedById: 'surti-01',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'comb-2',
    registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    fuelLiters: 220,
    equipmentId: 'eq-3',
    equipmentName: 'CM-310 - JAC',
    shift: 'T2',
    shiftObservation: 'Abastecimiento de ruta programada.',
    recordedByName: 'Marcos Benítez',
    recordedByEmail: 'surtidor@isola.com',
    recordedById: 'surti-01',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

import { safeStorage } from '../utils/storage';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  equipos: Equipo[];
  horometros: HorometroRecord[];
  combustible: CombustibleRecord[];
  activeModule: string;
  setActiveModule: (mod: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addUser: (user: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addEquipo: (equipo: Omit<Equipo, 'id' | 'createdAt' | 'name'>) => Promise<void>;
  updateEquipo: (equipo: Equipo) => Promise<void>;
  deleteEquipo: (equipoId: string) => Promise<void>;
  addHorometro: (record: Omit<HorometroRecord, 'id' | 'registeredAt' | 'totalHours'>) => Promise<void>;
  updateHorometro: (record: HorometroRecord) => Promise<void>;
  deleteHorometro: (id: string) => Promise<void>;
  addCombustible: (record: Omit<CombustibleRecord, 'id' | 'registeredAt'>) => Promise<void>;
  updateCombustible: (record: CombustibleRecord) => Promise<void>;
  deleteCombustible: (id: string) => Promise<void>;
  isFirebaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if there is an active session from an existing login, otherwise null (forces login view)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return safeStorage.getParsedItem<UserProfile | null>('isola_active_user', null);
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    return safeStorage.getParsedItem<UserProfile[]>('isola_users', INITIAL_USERS);
  });

  const [equipos, setEquipos] = useState<Equipo[]>(() => {
    return safeStorage.getParsedItem<Equipo[]>('isola_equipos', INITIAL_EQUIPOS);
  });

  const [horometros, setHorometros] = useState<HorometroRecord[]>(() => {
    return safeStorage.getParsedItem<HorometroRecord[]>('isola_horometros', INITIAL_HOROMETROS);
  });

  const [combustible, setCombustible] = useState<CombustibleRecord[]>(() => {
    return safeStorage.getParsedItem<CombustibleRecord[]>('isola_combustible', INITIAL_COMBUSTIBLE);
  });

  const [activeModule, setActiveModule] = useState<string>('horometros-entry');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Sync to safe storage for offline resiliency
  useEffect(() => {
    safeStorage.setItem('isola_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeStorage.setItem('isola_equipos', JSON.stringify(equipos));
  }, [equipos]);

  useEffect(() => {
    safeStorage.setItem('isola_horometros', JSON.stringify(horometros));
  }, [horometros]);

  useEffect(() => {
    safeStorage.setItem('isola_combustible', JSON.stringify(combustible));
  }, [combustible]);

  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem('isola_active_user', JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem('isola_active_user');
    }
  }, [currentUser]);

  // Firestore connection test and listener attachment
  useEffect(() => {
    testFirestoreConnection()
      .then((connected) => {
        setIsFirebaseConnected(connected);
      })
      .catch((err) => {
        console.warn('Initial connection check failed:', err);
      });

    // Subscribe to Firestore users collection
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: UserProfile[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as UserProfile), uid: d.id }));
          setUsers(list);
        }
      },
      (error) => {
        console.warn('Users listener (offline fallback):', error.message);
      }
    );

    // Subscribe to Firestore equipos
    const unsubEquipos = onSnapshot(
      collection(db, 'equipos'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Equipo[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as Equipo), id: d.id }));
          setEquipos(list);
        }
      },
      (error) => {
        console.warn('Equipos listener (offline fallback):', error.message);
      }
    );

    // Subscribe to Firestore horometros
    const unsubHoros = onSnapshot(
      collection(db, 'horometros'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HorometroRecord[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as HorometroRecord), id: d.id }));
          // sort descending by date and registration
          list.sort((a, b) => new Date(b.registeredAt || b.date).getTime() - new Date(a.registeredAt || a.date).getTime());
          setHorometros(list);
        }
      },
      (error) => {
        console.warn('Horometros listener (offline fallback):', error.message);
      }
    );

    // Subscribe to Firestore combustible
    const unsubComb = onSnapshot(
      collection(db, 'combustible'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: CombustibleRecord[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as CombustibleRecord), id: d.id }));
          list.sort((a, b) => new Date(b.registeredAt || b.date).getTime() - new Date(a.registeredAt || a.date).getTime());
          setCombustible(list);
        }
      },
      (error) => {
        console.warn('Combustible listener (offline fallback):', error.message);
      }
    );

    return () => {
      unsubUsers();
      unsubEquipos();
      unsubHoros();
      unsubComb();
    };
  }, []);

  // Update default active tab when role changes
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Operador') {
      setActiveModule('horometros-entry');
    } else if (currentUser.role === 'Surtidor') {
      setActiveModule('combustible-entry');
    }
  }, [currentUser?.role]);

  // Login handler strictly validating against registered users in the system
  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (password && found.password && found.password !== password) {
        throw new Error('Contraseña incorrecta');
      }
      setCurrentUser(found);
      safeStorage.setItem('isola_active_user', JSON.stringify(found));
      return true;
    }

    // Auto-detect master admin email
    if (cleanEmail === 'aplicacionisola@gmail.com') {
      const masterUser: UserProfile = {
        uid: 'admin-master',
        email: cleanEmail,
        name: 'Administrador Principal',
        role: 'Administrador',
        password: password || 'admin',
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [masterUser, ...prev]);
      setCurrentUser(masterUser);
      safeStorage.setItem('isola_active_user', JSON.stringify(masterUser));
      return true;
    }

    throw new Error('Usuario no registrado. Contacte al administrador en el Gestor de Usuarios.');
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // offline logout
    }
    safeStorage.removeItem('isola_active_user');
    setCurrentUser(null);
  };

  // CRUD operations
  const addUser = async (userData: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    const uid = 'user-' + Date.now();
    const newUser: UserProfile = {
      ...userData,
      uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);

    try {
      await setDoc(doc(db, 'users', uid), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users/' + uid);
    }
  };

  const updateUser = async (user: UserProfile) => {
    const updated = { ...user, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.uid === user.uid ? updated : u));
    if (currentUser?.uid === user.uid) {
      setCurrentUser(updated);
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), updated as unknown as Record<string, unknown>);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users/' + user.uid);
    }
  };

  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.uid !== userId));
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'users/' + userId);
    }
  };

  const addEquipo = async (data: Omit<Equipo, 'id' | 'createdAt' | 'name'>) => {
    const id = 'eq-' + Date.now();
    const autoName = `${data.code.trim()} - ${data.brand.trim()}`;
    const newEq: Equipo = {
      ...data,
      id,
      name: autoName,
      createdAt: new Date().toISOString(),
    };

    setEquipos(prev => [...prev, newEq]);

    try {
      await setDoc(doc(db, 'equipos', id), newEq);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'equipos/' + id);
    }
  };

  const updateEquipo = async (equipo: Equipo) => {
    const autoName = `${equipo.code.trim()} - ${equipo.brand.trim()}`;
    const updated = { ...equipo, name: autoName };
    setEquipos(prev => prev.map(e => e.id === equipo.id ? updated : e));

    try {
      await updateDoc(doc(db, 'equipos', equipo.id), updated as unknown as Record<string, unknown>);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'equipos/' + equipo.id);
    }
  };

  const deleteEquipo = async (equipoId: string) => {
    setEquipos(prev => prev.filter(e => e.id !== equipoId));
    try {
      await deleteDoc(doc(db, 'equipos', equipoId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'equipos/' + equipoId);
    }
  };

  const addHorometro = async (recordData: Omit<HorometroRecord, 'id' | 'registeredAt' | 'totalHours'>) => {
    const id = 'horo-' + Date.now();
    const hiddenRegisteredAt = new Date().toISOString(); // Auto-registered hidden timestamp
    const computedHours = Number((recordData.finalHorometer - recordData.initialHorometer).toFixed(2));

    const newRecord: HorometroRecord = {
      ...recordData,
      id,
      registeredAt: hiddenRegisteredAt,
      totalHours: computedHours >= 0 ? computedHours : 0,
      createdAt: hiddenRegisteredAt,
    };

    setHorometros(prev => [newRecord, ...prev]);

    try {
      await setDoc(doc(db, 'horometros', id), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'horometros/' + id);
    }
  };

  const updateHorometro = async (record: HorometroRecord) => {
    const computedHours = Number((record.finalHorometer - record.initialHorometer).toFixed(2));
    const updated = {
      ...record,
      totalHours: computedHours >= 0 ? computedHours : 0,
    };
    setHorometros(prev => prev.map(h => h.id === record.id ? updated : h));

    try {
      await updateDoc(doc(db, 'horometros', record.id), updated as unknown as Record<string, unknown>);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'horometros/' + record.id);
    }
  };

  const deleteHorometro = async (id: string) => {
    setHorometros(prev => prev.filter(h => h.id !== id));
    try {
      await deleteDoc(doc(db, 'horometros', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'horometros/' + id);
    }
  };

  const addCombustible = async (recordData: Omit<CombustibleRecord, 'id' | 'registeredAt'>) => {
    const id = 'comb-' + Date.now();
    const hiddenRegisteredAt = new Date().toISOString(); // Auto-registered hidden timestamp

    const newRecord: CombustibleRecord = {
      ...recordData,
      id,
      registeredAt: hiddenRegisteredAt,
      createdAt: hiddenRegisteredAt,
    };

    setCombustible(prev => [newRecord, ...prev]);

    try {
      await setDoc(doc(db, 'combustible', id), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'combustible/' + id);
    }
  };

  const updateCombustible = async (record: CombustibleRecord) => {
    setCombustible(prev => prev.map(c => c.id === record.id ? record : c));
    try {
      await updateDoc(doc(db, 'combustible', record.id), record as unknown as Record<string, unknown>);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'combustible/' + record.id);
    }
  };

  const deleteCombustible = async (id: string) => {
    setCombustible(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'combustible', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'combustible/' + id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        equipos,
        horometros,
        combustible,
        activeModule,
        setActiveModule,
        loginWithEmail,
        logout,
        addUser,
        updateUser,
        deleteUser,
        addEquipo,
        updateEquipo,
        deleteEquipo,
        addHorometro,
        updateHorometro,
        deleteHorometro,
        addCombustible,
        updateCombustible,
        deleteCombustible,
        isFirebaseConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
