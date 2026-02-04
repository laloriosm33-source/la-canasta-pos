import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Trash, Check, Shield, Building2, Mail, Key, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Branch {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions?: string;
    branchId?: string;
    branch?: { name: string };
}

const AVAILABLE_MODULES = [
    { id: 'POS', label: 'Punto de Venta' },
    { id: 'INVENTORY', label: 'Inventario' },
    { id: 'CUSTOMERS', label: 'Clientes' },
    { id: 'SETTINGS', label: 'Configuración' },
    { id: 'USERS', label: 'Usuarios' },
];

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        role: 'CASHIER',
        branchId: '',
        permissions: [] as string[]
    });

    const fetchData = useCallback(async () => {
        try {
            const [userRes, branchRes] = await Promise.all([
                api.get('/users'),
                api.get('/branches')
            ]);
            setUsers(userRes.data);
            setBranches(branchRes.data);
        } catch (error) {
            toast.error('Error al sincronizar lista de personal');
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (user?: User) => {
        if (user) {
            setFormData({
                id: user.id,
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                branchId: user.branchId || '',
                permissions: user.permissions ? user.permissions.split(',') : []
            });
        } else {
            setFormData({
                id: '',
                name: '',
                email: '',
                password: '',
                role: 'CASHIER',
                branchId: '',
                permissions: ['POS']
            });
        }
        setIsModalOpen(true);
    };

    const togglePermission = (moduleId: string) => {
        setFormData(prev => {
            const current = prev.permissions;
            if (current.includes(moduleId)) {
                return { ...prev, permissions: current.filter(p => p !== moduleId) };
            } else {
                return { ...prev, permissions: [...current, moduleId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                permissions: formData.permissions.join(','),
                branchId: formData.branchId || null
            };

            if (formData.id) {
                await api.put(`/users/${formData.id}`, payload);
                toast.success('Perfil actualizado correctamente');
            } else {
                await api.post('/users', payload);
                toast.success('Colaborador registrado');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al guardar cambios');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Revocar acceso permanentemente a "${name}"?`)) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('Cuenta eliminada');
            fetchData();
        } catch (error) {
            toast.error('No se puede eliminar la cuenta principal');
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Control Core</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Gestión de roles y privilegios de acceso.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <UserPlus size={24} /> Registrar Acceso
                </button>
            </header>

            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8">Colaborador</th>
                                <th className="px-10 py-8">Seguridad y Rol</th>
                                <th className="px-10 py-8">Protocolos de Acceso</th>
                                <th className="px-10 py-8 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all duration-500 shadow-inner">
                                                <UserIcon size={32} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-xl tracking-tighter leading-none mb-2 italic uppercase">{user.name}</p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Mail size={12} className="text-emerald-500" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black w-fit uppercase tracking-widest flex items-center gap-2 shadow-sm
                                                ${user.role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-emerald-600 text-white shadow-emerald-200'}`}>
                                                <Shield size={12} /> {user.role}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase italic ml-1 tracking-tighter">
                                                <Building2 size={12} className="text-slate-300" /> {user.branch?.name || 'Sede Central'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2 max-w-[300px]">
                                            {user.permissions?.split(',').map((p) => (
                                                <span key={p} className="text-[8px] font-black bg-white text-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm uppercase tracking-tighter italic">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="flex justify-center gap-3 translate-x-4 opacity-10 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <button onClick={() => handleOpenModal(user)} className="w-12 h-12 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-slate-100 transition-all shadow-sm hover:shadow-lg flex items-center justify-center"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(user.id, user.name)} className="w-12 h-12 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-100 transition-all shadow-sm hover:shadow-lg flex items-center justify-center"><Trash size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Configuración de Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto border border-white/10 custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><UserPlus size={32} className="rotate-45" /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <Shield size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Identity Hub</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Control Maestro de Accesos</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nombre Completo</label>
                                    <div className="relative">
                                        <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white font-black text-slate-800 transition-all text-xl shadow-inner"
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Identificador Único</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white font-black text-slate-800 transition-all text-xl shadow-inner"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Protocolo Operativo</label>
                                    <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-black text-slate-800 appearance-none cursor-pointer shadow-inner text-lg"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="CASHIER">Cajero / Vendedor</option>
                                        <option value="MANAGER">Gerente de División</option>
                                        <option value="ADMIN">Administrador de Red</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Sede de Operaciones</label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                        <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-black text-slate-800 appearance-none cursor-pointer shadow-inner text-lg"
                                            value={formData.branchId} onChange={e => setFormData({ ...formData, branchId: e.target.value })}>
                                            <option value="">Desbloqueo Global (Root)</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Clave de Activación</label>
                                <div className="relative">
                                    <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input type="password" className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white font-black text-slate-800 transition-all text-xl shadow-inner"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={formData.id ? '••••••••' : 'Asignar contraseña'} />
                                </div>
                            </div>

                            <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 shadow-inner">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 ml-2 italic leading-none">Matrix de Privilegios</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {AVAILABLE_MODULES.map(module => {
                                        const active = formData.permissions.includes(module.id);
                                        return (
                                            <div key={module.id}
                                                onClick={() => togglePermission(module.id)}
                                                className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-500
                                                ${active ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}>
                                                <span className="text-[10px] font-black uppercase tracking-tighter italic">{module.label}</span>
                                                {active && <Check size={16} className="text-emerald-400" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter">
                                    {formData.id ? 'Sincronizar Protocolo' : 'Activar Unidad'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 h-20 bg-rose-50 text-rose-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                    Descartar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
