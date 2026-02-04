import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, MapPin, Phone, Box, Users, Edit, Trash, X } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    _count?: {
        customers: number;
        inventory: number;
    }
}

const Branches = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', address: '', phone: '' });

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/branches');
            setBranches(res.data);
        } catch (error) {
            toast.error('Error al cargar sucursales');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/branches/${formData.id}`, formData);
                toast.success('¡Sucursal actualizada!');
            } else {
                await api.post('/branches', formData);
                toast.success('¡Sucursal creada!');
            }
            setIsModalOpen(false);
            fetchBranches();
            setFormData({ id: '', name: '', address: '', phone: '' });
        } catch (error) {
            toast.error('Error al guardar sucursal');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar sucursal "${name}"? Esto podría fallar si hay ventas o inventario asociado.`)) return;
        try {
            await api.delete(`/branches/${id}`);
            toast.success(`Sucursal "${name}" eliminada`);
            fetchBranches();
        } catch (error) {
            toast.error('No se puede eliminar una sucursal con registros activos');
        }
    };

    const openModal = (branch?: Branch) => {
        if (branch) {
            setFormData({ id: branch.id, name: branch.name, address: branch.address || '', phone: branch.phone || '' });
        } else {
            setFormData({ id: '', name: '', address: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Node Network</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Gestión de perímetros físicos y centros de distribución.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={24} /> Desplegar Nodo
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {branches.map((branch) => (
                    <div key={branch.id} className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-50 hover:shadow-indigo-500/10 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-emerald-500/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-[1.75rem] bg-slate-900 text-emerald-400 flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
                                <Building2 size={32} />
                            </div>
                            <div className="flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => openModal(branch)} className="w-10 h-10 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 transition-all flex items-center justify-center shadow-sm"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(branch.id, branch.name)} className="w-10 h-10 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all flex items-center justify-center shadow-sm"><Trash size={16} /></button>
                            </div>
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">{branch.name}</h3>
                        <div className="space-y-3 text-slate-400 text-[11px] font-black uppercase tracking-widest mb-10">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                <MapPin size={14} className="text-indigo-500 shrink-0" />
                                <span className="line-clamp-1 italic">{branch.address || 'Sin coordenadas'}</span>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                                <Phone size={14} className="text-emerald-500" />
                                <span className="tracking-tighter">{branch.phone || 'Sin contacto'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50 relative z-10">
                            <div className="text-center p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">Inventario</p>
                                <div className="flex items-center justify-center gap-2 font-black text-2xl text-slate-900 tracking-tighter">
                                    <Box size={20} className="text-emerald-500" />
                                    {branch._count?.inventory || 0}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                <p className="text-[8px] uppercase font-black text-slate-400 mb-2 tracking-widest">Clientes</p>
                                <div className="flex items-center justify-center gap-2 font-black text-2xl text-slate-900 tracking-tighter">
                                    <Users size={20} className="text-indigo-500" />
                                    {branch._count?.customers || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && branches.length === 0 && (
                    <div className="col-span-full py-48 text-center bg-white rounded-[4rem] border border-slate-100 shadow-inner">
                        <Building2 size={96} className="mx-auto text-slate-50 mb-8" />
                        <h4 className="text-4xl font-black text-slate-200 tracking-tighter uppercase italic">Red Inactiva</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">No se han desplegado nodos de operación en el sistema.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white/10">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <Building2 size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Node Config</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Sincronización de Perímetro Físico</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nombre del Nodo</label>
                                <input required className="w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-2xl shadow-inner placeholder:text-slate-200"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Matriz Corporativa" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Geolocalización / Domicilio</label>
                                <input className="w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-bold text-slate-900 transition-all text-xl shadow-inner placeholder:text-slate-200"
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, Ciudad y Estado..." />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Línea de Enlace</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input className="w-full pl-16 pr-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-xl shadow-inner placeholder:text-slate-200"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="664 000 0000" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                    Confirmar Despliegue
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                    Abortar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Branches;
