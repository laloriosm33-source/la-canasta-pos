import { useState, useEffect, useCallback } from 'react';
import { Box, Search, ArrowUp, ArrowDown, History, X, User as UserIcon, RefreshCcw } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../context/StoreContext';

interface Branch {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    code: string;
    unit: string;
    provider?: { name: string };
    inventory?: Array<{
        id: string;
        quantity: string;
        branchId: string;
        branch: Branch;
    }>;
}

interface InventoryItem {
    id: string; // ProductBranch ID
    productId: string;
    quantity: number;
    product: {
        name: string;
        code: string;
        unit: string;
        provider?: { name: string };
    };
    branch: Branch;
}

interface HistoryRecord {
    id: string;
    productId: string;
    product?: { name: string };
    quantity: string;
    reason: string;
    date: string;
    user?: { name: string };
}

const Inventory = () => {
    const { selectedBranchId } = useStore();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [entryData, setEntryData] = useState({
        productId: '',
        quantity: '',
        reason: 'Entrada de Mercancía'
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            const products: Product[] = res.data;
            setAllProducts(products);

            const items: InventoryItem[] = [];

            products.forEach((p) => {
                if (p.inventory && p.inventory.length > 0) {
                    p.inventory.forEach((inv) => {
                        items.push({
                            id: inv.id,
                            productId: p.id,
                            quantity: parseFloat(inv.quantity),
                            product: {
                                name: p.name,
                                code: p.code,
                                unit: p.unit,
                                provider: p.provider
                            },
                            branch: { id: inv.branchId, name: inv.branch?.name || 'Sucursal' }
                        });
                    });
                }
            });
            setInventory(items);
        } catch {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/inventory/history');
            setHistory(res.data);
            setIsHistoryModalOpen(true);
        } catch {
            toast.error('No se pudo cargar el historial');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleAdjustment = async (item: InventoryItem, type: 'increment' | 'decrement') => {
        const amountStr = prompt(`Ingrese cantidad a ${type === 'increment' ? 'sumar' : 'restar'} para ${item.product.name} en ${item.branch.name}:`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Cantidad inválida");
            return;
        }

        try {
            await api.post('/inventory/adjust', {
                productId: item.productId,
                branchId: item.branch.id,
                quantity: type === 'increment' ? amount : -amount,
                reason: type === 'increment' ? 'Ajuste Manual (+)' : 'Ajuste Manual (-)',
                userId: currentUser.id
            });

            toast.success("Inventario actualizado");
            fetchData();
        } catch {
            toast.error("Error al actualizar inventario");
        }
    };

    const handleStockEntry = async (e: React.FormEvent) => {
        e.preventDefault();

        const branchToUse = selectedBranchId === 'all' ? null : selectedBranchId;
        if (!branchToUse) {
            return toast.error("Selecciona una sucursal específica en la barra lateral para cargar stock.");
        }

        if (!entryData.productId || !entryData.quantity) {
            return toast.error("Completa todos los campos");
        }

        try {
            await api.post('/inventory/adjust', {
                ...entryData,
                branchId: branchToUse,
                quantity: parseFloat(entryData.quantity),
                userId: currentUser.id
            });
            toast.success("Mercancía ingresada correctamente");
            setIsEntryModalOpen(false);
            setEntryData({ productId: '', quantity: '', reason: 'Entrada de Mercancía' });
            fetchData();
        } catch {
            toast.error("Error al ingresar mercancía");
        }
    };

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.code?.includes(searchTerm);
        const matchesBranch = selectedBranchId === 'all' || item.branch.id === selectedBranchId;
        return matchesSearch && matchesBranch;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <Toaster position="top-right" />

            {/* Superior Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2 italic">Kardex Central</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-slate-500 font-bold text-sm tracking-tight capitalize">
                            {selectedBranchId === 'all' ? 'Vista Global de Existencias' : `Sede Operativa: ${filteredItems[0]?.branch.name || 'Solicitando datos...'}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button onClick={fetchHistory} variant="secondary" icon={History} className="flex-1 md:flex-none !rounded-2xl h-14 font-black px-6 border-slate-200">Bitácora</Button>
                    <Button onClick={() => setIsEntryModalOpen(true)} variant="primary" icon={ArrowUp} className="flex-1 md:flex-none !rounded-2xl h-14 font-black px-8 bg-slate-900 border-none shadow-xl shadow-slate-200">Cargar Stock</Button>
                </div>
            </header>

            {/* Sticky Search Bar */}
            <div className="sticky top-4 z-30 bg-white/70 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/20 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre del artículo o SKU maestro..."
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 shadow-inner font-bold text-slate-600 transition-all text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="p-4 bg-white text-slate-400 hover:text-emerald-500 rounded-2xl border border-slate-100 hover:border-emerald-500/20 transition-all shadow-sm active:rotate-180 duration-500"
                >
                    <RefreshCcw size={22} />
                </button>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[11px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8">Descripción del Producto</th>
                                {selectedBranchId === 'all' && <th className="px-10 py-8">Sede</th>}
                                <th className="px-10 py-8">Stock Nominal</th>
                                <th className="px-10 py-8 text-center">Analítica</th>
                                <th className="px-10 py-8 text-right">Ajustes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 leading-tight text-xl tracking-tighter group-hover:text-emerald-600 transition-colors">{item.product.name}</span>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-black uppercase tracking-widest">
                                                    {item.product.provider?.name || 'ALMACÉN PROPIO'}
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-slate-300 tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">REF: {item.product.code || 'S/N'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {selectedBranchId === 'all' && (
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 bg-white border border-slate-100 shadow-sm text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest truncate max-w-[120px] inline-block">
                                                {item.branch.name}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-10 py-8">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={`font-black text-4xl tracking-tighter ${item.quantity <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                                                {item.quantity}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.product.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-center">
                                            {item.quantity <= 0 ? (
                                                <span className="inline-flex items-center gap-2 text-[10px] font-black text-white bg-slate-900 px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-slate-900/20">
                                                    Agotado
                                                </span>
                                            ) : item.quantity <= 5 ? (
                                                <span className="inline-flex items-center gap-2 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl uppercase tracking-widest">
                                                    Crítico
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl uppercase tracking-widest">
                                                    Óptimo
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-end gap-3 translate-x-4 opacity-10 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                onClick={() => handleAdjustment(item, 'increment')}
                                                className="w-12 h-12 bg-white text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-xl border border-slate-100 flex items-center justify-center">
                                                <ArrowUp size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleAdjustment(item, 'decrement')}
                                                className="w-12 h-12 bg-white text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm hover:shadow-xl border border-slate-100 flex items-center justify-center">
                                                <ArrowDown size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filteredItems.length === 0 && (
                        <div className="py-40 text-center flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                <Box size={48} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tighter">Sin registros de inventario</h4>
                                <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Sincronización completa</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Entrada de Stock */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white/20">
                        <button onClick={() => setIsEntryModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors">
                            <X size={32} />
                        </button>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-slate-900 text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl">
                                <ArrowUp size={40} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">Ingreso Stock</h3>
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest opacity-60">Suministro de mercancía</p>
                            </div>
                        </div>

                        <form onSubmit={handleStockEntry} className="space-y-10">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Ficha del Artículo</label>
                                <select required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none font-black text-slate-800 transition-all appearance-none cursor-pointer text-xl shadow-inner italic"
                                    value={entryData.productId} onChange={e => setEntryData({ ...entryData, productId: e.target.value })}>
                                    <option value="">Buscar en Catálogo Digital...</option>
                                    {allProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Carga Física</label>
                                    <input type="number" step="0.01" required
                                        className="w-full p-6 bg-slate-900 text-white border-none rounded-[2rem] focus:ring-8 focus:ring-emerald-500/20 outline-none font-black text-3xl shadow-2xl text-center"
                                        placeholder="0.00"
                                        value={entryData.quantity} onChange={e => setEntryData({ ...entryData, quantity: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Motivo / Log</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 text-lg shadow-inner"
                                        value={entryData.reason} onChange={e => setEntryData({ ...entryData, reason: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all">
                                    Finalizar Carga
                                </button>
                                <button type="button" onClick={() => setIsEntryModalOpen(false)} className="px-10 h-20 bg-rose-50 text-rose-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Bitácora */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-3xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                        <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-12 right-12 p-3 text-slate-400 hover:bg-slate-50 rounded-2xl">
                            <X size={32} />
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                    <History size={48} />
                                </div>
                                <div>
                                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic">Auditoría</h3>
                                    <p className="text-slate-400 mt-2 font-black uppercase text-xs tracking-widest opacity-60">Reporte de Trazabilidad Integral</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-6 space-y-4 custom-scrollbar">
                            {history.length === 0 && <div className="py-40 text-center text-slate-300 font-black italic text-2xl opacity-20 uppercase tracking-widest">Memoria histórica vacía</div>}
                            {history.map((record) => (
                                <div key={record.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[3rem] flex flex-col md:flex-row justify-between items-center group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                                        <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-xl ${parseFloat(record.quantity) > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {parseFloat(record.quantity) > 0 ? <ArrowUp size={40} /> : <ArrowDown size={40} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-3xl leading-tight tracking-tighter truncate max-w-[300px]">{record.product?.name || 'Artículo Descontinuado'}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                    <UserIcon size={14} className="text-slate-300" /> Operador: {record.user?.name || 'SISTEMA'}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-200/30 rounded-lg">
                                                    {new Date(record.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <div className={`text-5xl font-black tracking-tighter leading-none mb-2 ${parseFloat(record.quantity) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {parseFloat(record.quantity) > 0 ? '+' : ''}{record.quantity}
                                        </div>
                                        <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] inline-block">
                                            {record.reason}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12 mt-10 border-t border-slate-50 flex justify-center">
                            <button onClick={() => setIsHistoryModalOpen(false)} className="px-20 h-18 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm italic">
                                Sincronizar y Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
