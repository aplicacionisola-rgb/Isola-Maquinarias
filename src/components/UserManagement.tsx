import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  AlertCircle, 
  Shield 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, Role } from '../types';

export const UserManagement: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser, setActiveModule } = useApp();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Operador');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'Administrador';

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Acceso Exclusivo Administrador</h2>
          <p className="text-xs text-slate-500 mb-4">
            El Gestor de Usuarios y Roles está restringido a administradores de Isola Maquinarias.
          </p>
          <button
            onClick={() => setActiveModule('horometros-entry')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Volver a Horómetros
          </button>
        </div>
      </div>
    );
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setError('Ya existe un usuario registrado con este correo electrónico.');
      return;
    }

    try {
      await addUser({
        email: cleanEmail,
        name: name.trim(),
        role,
        password: password.trim() || 'isola123',
      });

      setShowAddModal(false);
      setEmail('');
      setName('');
      setPassword('');
      setRole('Operador');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser);
      setEditingUser(null);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteUser(deletingId);
      setDeletingId(null);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Supervisor': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Surtidor': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Operador': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Chakra_Petch',sans-serif]">
              GESTIÓN DE <span className="text-purple-700">USUARIOS</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración de cuentas, credenciales y asignación de roles (Operador, Surtidor, Supervisor, Administrador)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Agregar Usuario</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700 font-mono">
          <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
            Admins: {users.filter(u => u.role === 'Administrador').length}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-semibold">
            Supervisores: {users.filter(u => u.role === 'Supervisor').length}
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-semibold">
            Surtidores: {users.filter(u => u.role === 'Surtidor').length}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Operadores: {users.filter(u => u.role === 'Operador').length}
          </span>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Contraseña Terreno</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs border border-purple-200">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                    {u.email}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getRoleBadgeStyle(u.role)}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                    {u.password ? '••••••••' : '(Google Auth)'}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingUser({ ...u })}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Editar usuario"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(u.uid)}
                        disabled={currentUser?.uid === u.uid}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition disabled:opacity-30"
                        title={currentUser?.uid === u.uid ? 'No puedes auto-eliminarte' : 'Eliminar usuario'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>Ingresar Nuevo Usuario</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra nombre, correo electrónico, contraseña de acceso y rol operacional.
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Esteban Valdés"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ej: operador@isola.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rol en Isola Maquinarias</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                >
                  <option value="Operador">Operador (Ingreso de horómetros)</option>
                  <option value="Surtidor">Surtidor (Ingreso y control de combustible)</option>
                  <option value="Supervisor">Supervisor (Gestión de equipos, edición y dashboard)</option>
                  <option value="Administrador">Administrador (Control total del sistema)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-600" />
              <span>Editar Usuario ({editingUser.name})</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correo</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nueva Contraseña (Opcional)</label>
                <input
                  type="text"
                  placeholder="Mantener contraseña actual"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                >
                  <option value="Operador">Operador</option>
                  <option value="Surtidor">Surtidor</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                >
                  Actualizar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-2">¿Eliminar este usuario?</h3>
            <p className="text-xs text-slate-600 mb-4">
              El usuario perderá inmediatamente el acceso a los módulos según su rol.
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
    </div>
  );
};
