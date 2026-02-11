import { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, Phone, Mail, MapPin, Edit, Trash, Globe, X } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Provider {
    id: string;
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    rfc?: string;
    address?: string;
}

const Providers = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        id: '', name: '', contact: '', phone: '', email: '', rfc: '', address: ''
    });

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/providers');
            setProviders(res.data);
        } catch {
            toast.error('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchProviders(), 0);
        return () => clearTimeout(timer);
    }, [fetchProviders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/providers/${formData.id}`, formData);
                toast.success('Proveedor actualizado');
            } else {
                await api.post('/providers', formData);
                toast.success('Proveedor registrado');
            }
            setIsModalOpen(false);
            fetchProviders();
            setFormData({ id: '', name: '', contact: '', phone: '', email: '', rfc: '', address: '' });
        } catch {
            toast.error('Error al guardar proveedor');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar proveedor "${name}"?`)) return;
        try {
            await api.delete(`/providers/${id}`);
            toast.success('Proveedor eliminado');
            fetchProviders();
        } catch {
            toast.error('Error al eliminar (puede tener productos asociados)');
        }
    };

    const openModal = (provider?: Provider) => {
        if (provider) {
            setFormData({
                id: provider.id,
                name: provider.name,
                contact: provider.contact || '',
                phone: provider.phone || '',
                email: provider.email || '',
                rfc: provider.rfc || '',
                address: provider.address || ''
            });
        } else {
            setFormData({ id: '', name: '', contact: '', phone: '', email: '', rfc: '', address: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Supply Chain</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Gestión de socios comerciales y fuentes de abastecimiento.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={24} /> Registrar Socio
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {providers.map((p) => (
                    <div key={p.id} className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-50 hover:shadow-emerald-500/10 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-emerald-500/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-[1.75rem] bg-slate-100 text-slate-900 flex items-center justify-center shadow-inner group-hover:bg-slate-900 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500">
                                <Truck size={32} />
                            </div>
                            <div className="flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => openModal(p)} className="w-10 h-10 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 transition-all flex items-center justify-center shadow-sm"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(p.id, p.name)} className="w-10 h-10 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all flex items-center justify-center shadow-sm"><Trash size={16} /></button>
                            </div>
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">{p.name}</h3>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-8">{p.contact || 'Representante No Asignado'}</p>

                        <div className="space-y-4 text-slate-400 text-[11px] font-black uppercase tracking-widest mb-10 border-t border-slate-50 pt-8">
                            {p.phone && (
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-colors uppercase italic">
                                    <Phone size={14} className="text-emerald-500" /> {p.phone}
                                </div>
                            )}
                            {p.email && (
                                <div className="flex items-center gap-3 ml-3 lowercase tracking-tight">
                                    <Mail size={14} className="text-indigo-500" /> {p.email}
                                </div>
                            )}
                            {p.rfc && (
                                <div className="flex items-center gap-3 ml-3">
                                    <Globe size={14} className="text-slate-300" />
                                    <span className="font-mono text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-lg tracking-tighter italic">{p.rfc}</span>
                                </div>
                            )}
                            {p.address && (
                                <div className="flex items-center gap-3 ml-3">
                                    <MapPin size={14} className="text-rose-500 shrink-0" />
                                    <span className="line-clamp-1 italic text-[9px]">{p.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {!loading && providers.length === 0 && (
                    <div className="col-span-full py-48 text-center bg-white rounded-[4rem] border border-slate-100 shadow-inner">
                        <Truck size={96} className="mx-auto text-slate-50 mb-8" />
                        <h4 className="text-4xl font-black text-slate-200 tracking-tighter uppercase italic">Red de Suministro Vacía</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">No se han registrado socios comerciales para el abastecimiento.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white/10 custom-scrollbar mt-12 mb-12 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <Truck size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Partner Hub</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Sincronización de Canal de Abasto</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Razón Social / Identidad</label>
                                <input required className="w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-2xl shadow-inner placeholder:text-slate-200"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nombre del proveedor..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Representante</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-lg shadow-inner"
                                        value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        placeholder="Nombre del enlace..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Identificación Fiscal</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-mono font-black text-slate-900 text-lg shadow-inner uppercase"
                                        value={formData.rfc} onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                                        placeholder="RFC / Tax ID" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Línea de Enlace</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-lg shadow-inner"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="664 000 0000" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Correo Maestro</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input type="email" className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-lg shadow-inner"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="socio@partner.com" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Bodega Central / Domicilio</label>
                                <input className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-bold text-slate-900 text-xl shadow-inner"
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, Ciudad, Referencias Logísticas..." />
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                    Confirmar Alianza
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

export default Providers;
