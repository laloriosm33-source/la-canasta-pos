import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Plus, CheckCircle2, Clock, XCircle, Box, Calendar, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Branch {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    unit: string;
}

interface TransferItem {
    product: {
        name: string;
        unit: string;
    };
    quantity: number;
}

interface Transfer {
    id: string;
    date: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    sourceBranch: Branch;
    destBranch: Branch;
    details: TransferItem[];
}

interface FormDetail {
    productId: string;
    quantity: number;
    name?: string;
}

const Transfers = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        sourceBranchId: '',
        destBranchId: '',
        details: [] as FormDetail[]
    });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [qty, setQty] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, bRes, pRes] = await Promise.all([
                api.get('/transfers'),
                api.get('/branches'),
                api.get('/products')
            ]);
            setTransfers(tRes.data);
            setBranches(bRes.data);
            setProducts(pRes.data);
        } catch {
            toast.error('Error al cargar datos logísticos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const addItem = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, { productId: product.id, quantity: qty, name: product.name }]
        }));
        setSelectedProduct('');
        setQty(1);
    };

    const removeItem = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.sourceBranchId === formData.destBranchId) {
            return toast.error('Rutas de origen y destino deben ser distintas');
        }
        if (formData.details.length === 0) {
            return toast.error('El manifiesto debe contener al menos un artículo');
        }

        try {
            await api.post('/transfers', formData);
            toast.success('Protocolo de traspaso iniciado');
            setIsModalOpen(false);
            fetchData();
            setFormData({ sourceBranchId: '', destBranchId: '', details: [] });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || 'Fallo en la sincronización del traspaso');
        }
    };

    const handleComplete = async (id: string) => {
        if (!confirm('¿Validar recepción física de mercancía?')) return;
        try {
            await api.post(`/transfers/${id}/complete`);
            toast.success('Traspaso consolidado: Stock actualizado');
            fetchData();
        } catch {
            toast.error('Error al consolidar traspaso');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-600 text-white shadow-emerald-200';
            case 'CANCELLED': return 'bg-rose-600 text-white shadow-rose-200';
            default: return 'bg-amber-500 text-white shadow-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={12} />;
            case 'CANCELLED': return <XCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Logistics Hub</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Movimiento de activos y balanceo de stock entre nodos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={24} /> Nuevo Traspaso
                </button>
            </header>

            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8 italic">Manifiesto / Fecha</th>
                                <th className="px-10 py-8 italic">Ruta Logística</th>
                                <th className="px-10 py-8 italic">Carga Ética</th>
                                <th className="px-10 py-8 italic">Status</th>
                                <th className="px-10 py-8 text-center italic">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transfers.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg tracking-tighter leading-none mb-1">{new Date(t.date).toLocaleDateString()}</p>
                                                <p className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-tighter">BATCH-ID: {t.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100/50 w-fit">
                                            <span className="font-black text-slate-900 text-xs italic uppercase tracking-tighter">{t.sourceBranch.name}</span>
                                            <ArrowLeftRight size={16} className="text-slate-300" />
                                            <span className="font-black text-emerald-600 text-xs italic uppercase tracking-tighter">{t.destBranch.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div>
                                            <p className="text-xs font-black text-slate-900 tracking-tighter mb-1 uppercase italic">
                                                {t.details.length} Unidades SKU
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[180px]">
                                                {t.details.map(d => d.product.name).join(', ')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black shadow-lg flex items-center gap-2 w-fit uppercase tracking-widest ${getStatusStyle(t.status)}`}>
                                            {getStatusIcon(t.status)}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        {t.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleComplete(t.id)}
                                                className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest italic translate-x-4 opacity-10 group-hover:translate-x-0 group-hover:opacity-100">
                                                Consolidar Carga
                                            </button>
                                        )}
                                        {t.status !== 'PENDING' && (
                                            <CheckCircle2 size={24} className="mx-auto text-slate-100" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && transfers.length === 0 && (
                        <div className="py-48 text-center bg-white rounded-[4rem] border border-slate-100 shadow-inner">
                            <ArrowLeftRight size={96} className="mx-auto text-slate-50 mb-8" />
                            <h4 className="text-4xl font-black text-slate-200 tracking-tighter uppercase italic">Red Sin Movimiento</h4>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">No se han registrado traspasos de activos entre nodos.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-2xl relative border border-white/10 custom-scrollbar mt-12 mb-12 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><XCircle size={32} className="rotate-45" /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <ArrowLeftRight size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Cargo Manifest</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Protocolo de Movimiento de Activos</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

                                <div className="space-y-4 relative z-10">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nodo Origen</label>
                                    <select required className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none font-black text-white text-lg appearance-none cursor-pointer"
                                        value={formData.sourceBranchId} onChange={e => setFormData({ ...formData, sourceBranchId: e.target.value })}>
                                        <option value="" className="text-slate-900">Seleccionar Enlace...</option>
                                        {branches.map(b => <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2 italic">Nodo Destino</label>
                                    <select required className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none font-black text-white text-lg appearance-none cursor-pointer"
                                        value={formData.destBranchId} onChange={e => setFormData({ ...formData, destBranchId: e.target.value })}>
                                        <option value="" className="text-slate-900">Seleccionar Destino...</option>
                                        {branches.map(b => <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Carga de Artículos</label>
                                <div className="flex gap-4">
                                    <select className="flex-1 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-black italic outline-none text-slate-900 shadow-inner text-lg appearance-none"
                                        value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                                        <option value="">Buscar en Catálogo...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} [{p.unit}]</option>)}
                                    </select>
                                    <input type="number" step="any" className="w-[120px] p-6 bg-white border-2 border-slate-900 rounded-[2rem] font-black text-center outline-none text-2xl shadow-xl"
                                        value={qty} onChange={e => setQty(Number(e.target.value))} />
                                    <button type="button" onClick={addItem} className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 hover:scale-110 active:scale-95 transition-all">
                                        <Plus size={32} />
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-4 custom-scrollbar">
                                    {formData.details.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-6 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-sm animate-in slide-in-from-right-4 transition-all hover:bg-white hover:shadow-xl group/item">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg italic shadow-xl">
                                                    {item.quantity}
                                                </div>
                                                <span className="font-black text-slate-800 uppercase italic tracking-tighter text-xl">{item.name}</span>
                                            </div>
                                            <button type="button" onClick={() => removeItem(idx)} className="w-12 h-12 flex items-center justify-center text-slate-200 hover:text-rose-600 transition-colors">
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.details.length === 0 && (
                                        <div className="py-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                            <Box size={40} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Manifiesto Vacío</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                    Distribuir Carga
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

export default Transfers;
