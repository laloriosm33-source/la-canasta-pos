import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash, Box, Tag, Truck as TruckIcon, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
}

interface Provider {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    code?: string;
    priceRetail?: string;
    priceWholesale?: string;
    cost?: string;
    stock?: number;
    unit: string;
    categoryId?: string;
    providerId?: string;
    category?: Category;
    provider?: Provider;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        code: '',
        priceRetail: '',
        priceWholesale: '',
        cost: '',
        unit: 'pza',
        categoryId: '',
        providerId: '',
        minStock: '0'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, cRes, provRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/providers')
            ]);
            setProducts(pRes.data);
            setCategories(cRes.data);
            setProviders(provRes.data);
        } catch {
            toast.error('Error al cargar datos del catálogo');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                priceRetail: parseFloat(formData.priceRetail) || 0,
                priceWholesale: parseFloat(formData.priceWholesale) || 0,
                cost: parseFloat(formData.cost) || 0,
                minStock: parseFloat(formData.minStock) || 0,
                categoryId: formData.categoryId || null,
                providerId: formData.providerId || null
            };

            if (formData.id) {
                await api.put(`/products/${formData.id}`, payload);
                toast.success('Producto actualizado con éxito');
            } else {
                await api.post('/products', payload);
                toast.success('Nuevo producto registrado');
            }
            setIsModalOpen(false);
            fetchData();
        } catch {
            toast.error('Error al procesar la solicitud');
        }
    };

    const handleEdit = (p: Product) => {
        setFormData({
            id: p.id,
            name: p.name,
            code: p.code || '',
            priceRetail: p.priceRetail?.toString() || '',
            priceWholesale: p.priceWholesale?.toString() || '',
            cost: p.cost?.toString() || '',
            unit: p.unit,
            categoryId: p.categoryId || '',
            providerId: p.providerId || '',
            minStock: '0'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${name}" permanentemente?`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Eliminado del catálogo');
            fetchData();
        } catch {
            toast.error('Error: El producto tiene registros vinculados.');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <Toaster position="top-right" />

            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Catálogo Maestro</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Administración centralizada de artículos y precios.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ id: '', name: '', code: '', priceRetail: '', priceWholesale: '', cost: '', unit: 'pza', categoryId: '', providerId: '', minStock: '0' });
                        setIsModalOpen(true);
                    }}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={24} /> Registrar Artículo
                </button>
            </header>

            {/* Content Card */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={22} />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo digital..."
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/20 font-bold text-slate-700 shadow-sm text-lg transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8">Descripción</th>
                                <th className="px-10 py-8">Atributos</th>
                                <th className="px-10 py-8 text-right">Estructura Precios</th>
                                <th className="px-10 py-8 text-right">Márgenes</th>
                                <th className="px-10 py-8 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((p) => {
                                const retail = parseFloat(p.priceRetail || '0');
                                const cost = parseFloat(p.cost || '0');
                                const margin = retail > 0 ? ((retail - cost) / retail) * 100 : 0;

                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/30 transition-all duration-300 group font-sans">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all duration-500">
                                                    <Box size={28} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-xl tracking-tighter leading-none mb-2">{p.name}</p>
                                                    <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-mono font-black w-fit uppercase tracking-tighter shadow-xl">
                                                        REF: {p.code || 'S/N'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit border border-emerald-100 uppercase tracking-widest whitespace-nowrap">
                                                    <Tag size={12} /> {p.category?.name || 'GENÉRICO'}
                                                </span>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter">
                                                    <TruckIcon size={12} className="text-slate-300" /> {p.provider?.name || 'EXTERNO'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">${retail.toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Por {p.unit}</p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-baseline gap-1">
                                                    <TrendingUp size={12} className={margin > 20 ? 'text-emerald-500' : 'text-orange-500'} />
                                                    <p className={`text-xl font-black tracking-tight ${margin > 20 ? 'text-emerald-600' : 'text-orange-600'}`}>{margin.toFixed(0)}%</p>
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Costo: ${cost.toFixed(2)}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="flex justify-center gap-3 translate-x-4 opacity-10 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => handleEdit(p)} className="w-12 h-12 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-slate-100 transition-all shadow-sm hover:shadow-lg flex items-center justify-center"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id, p.name)} className="w-12 h-12 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-100 transition-all shadow-sm hover:shadow-lg flex items-center justify-center"><Trash size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && !loading && (
                        <div className="py-40 text-center text-slate-300 flex flex-col items-center">
                            <Box size={72} className="mb-6 opacity-10" />
                            <p className="font-black text-2xl tracking-tighter text-slate-400 uppercase">Sin artículos registrados</p>
                            <p className="text-xs font-bold mt-2 tracking-widest text-slate-300 uppercase">El catálogo maestro se encuentra vacío.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Modern Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-3xl shadow-2xl relative max-h-[95vh] overflow-y-auto border border-white/10 custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><Plus size={32} className="rotate-45" /></button>

                        <div className="flex items-center gap-8 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
                                <Box size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">{formData.id ? 'Edit Unit' : 'Create Unit'}</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Sincronización de Catálogo Digital</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Nombre Comercial</label>
                                    <input required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 font-black text-slate-800 transition-all text-2xl shadow-inner placeholder:text-slate-200"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Descripción del artículo..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Ref / SKU</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 font-mono font-black text-slate-800 transition-all text-2xl shadow-inner placeholder:text-slate-200 uppercase"
                                        value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="000000000000" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

                                <div className="space-y-4 relative z-10">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Costo Neto</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-3xl">$</span>
                                        <input type="number" step="0.01" className="w-full pl-12 p-6 bg-white/5 border border-white/10 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/30 outline-none font-black text-emerald-400 text-3xl shadow-inner"
                                            value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Venta Público</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-3xl">$</span>
                                        <input type="number" step="0.01" required className="w-full pl-12 p-6 bg-white border-none rounded-[1.5rem] focus:ring-8 focus:ring-emerald-500/20 outline-none font-black text-slate-900 text-3xl shadow-2xl"
                                            value={formData.priceRetail} onChange={e => setFormData({ ...formData, priceRetail: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Presentación</label>
                                    <select className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none font-black text-white text-xl appearance-none cursor-pointer"
                                        value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="pza" className="text-slate-900 font-black">Pieza (PZA)</option>
                                        <option value="kg" className="text-slate-900 font-black">Kilogramo (KG)</option>
                                        <option value="l" className="text-slate-900 font-black">Litro (L)</option>
                                        <option value="caja" className="text-slate-900 font-black">Caja Master</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Segmento / Categoría</label>
                                    <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-black text-slate-800 appearance-none cursor-pointer shadow-inner text-lg italic"
                                        value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                        <option value="">Seleccionar Sección...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Cadena de Suministro</label>
                                    <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-black text-slate-800 appearance-none cursor-pointer shadow-inner text-lg italic"
                                        value={formData.providerId} onChange={e => setFormData({ ...formData, providerId: e.target.value })}>
                                        <option value="">Origen Directo</option>
                                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter">
                                    {formData.id ? 'Actualizar Ficha Global' : 'Validar y Registrar'}
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

export default Products;
