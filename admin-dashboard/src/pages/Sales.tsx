import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Calendar,
    Printer,
    FileText,
    X,
    Eye,
    Building2,
    User,
    CreditCard,
    Banknote,
    Tag,
    History,
    CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../context/StoreContext';
import { printReceipt } from '../utils/printer';

interface SaleDetail {
    id: string;
    product: { name: string; unit: string; code?: string };
    quantity: string;
    unitPrice: string;
    subtotal: string;
}

interface Sale {
    id: string;
    date: string;
    total: string;
    paymentMethod: string;
    status: 'COMPLETED' | 'CANCELLED';
    branch: { name: string };
    user?: { name: string };
    customer?: { name: string };
    details: SaleDetail[];
}

const Sales = () => {
    const { selectedBranchId } = useStore();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [dateFilter, setDateFilter] = useState('');

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales');
            setSales(res.data);
        } catch {
            toast.error('Error al sincronizar historial de transacciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const filteredSales = sales.filter(s => {
        const matchesBranch = selectedBranchId === 'all' || (s as Sale & { branchId: string }).branchId === selectedBranchId;
        const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || s.date.startsWith(dateFilter);
        return matchesBranch && matchesSearch && matchesDate;
    });

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <Banknote className="text-emerald-500" size={16} />;
            case 'CREDIT': return <CreditCard className="text-rose-500" size={16} />;
            case 'TRANSFER': return <div className="w-4 h-4 rounded-full bg-blue-500" />;
            default: return <Tag className="text-slate-400" size={16} />;
        }
    };

    const handlePrint = (sale: Sale) => {
        printReceipt({
            businessName: 'LA CANASTA',
            address: 'Sucursal: ' + sale.branch.name,
            date: new Date(sale.date).toLocaleString(),
            orderId: sale.id.slice(0, 8).toUpperCase(),
            items: sale.details.map(d => ({
                name: d.product.name,
                quantity: parseFloat(d.quantity),
                price: parseFloat(d.unitPrice),
                total: parseFloat(d.subtotal)
            })),
            total: parseFloat(sale.total),
            cashier: sale.user?.name || 'Sistema'
        });
        toast.success('Ticket enviado a impresión');
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic uppercase">Audit Archive</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Historial maestro de operaciones y flujo de caja.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-4">
                        <History size={24} className="text-slate-900" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Logs</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{filteredSales.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl py-6">
                <div className="relative group col-span-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={22} />
                    <input
                        type="text"
                        placeholder="Buscar por Folio, Cliente o Cajero..."
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900/20 font-black text-slate-800 shadow-sm text-lg transition-all italic placeholder:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={22} />
                    <input
                        type="date"
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900/20 font-black text-slate-800 shadow-sm text-lg transition-all"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8 italic">Data Folio / Time</th>
                                <th className="px-10 py-8 italic">Contexto</th>
                                <th className="px-10 py-8 italic">Method</th>
                                <th className="px-10 py-8 italic">Net Total</th>
                                <th className="px-10 py-8 text-center italic">Monitor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div>
                                            <p className="text-xs font-mono font-black text-slate-300 uppercase leading-none mb-2">#{sale.id.slice(0, 12).toUpperCase()}</p>
                                            <p className="font-black text-slate-900 text-lg tracking-tighter leading-none italic">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(sale.date).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{sale.branch.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sale.user?.name || 'Pos System'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner w-fit">
                                            {getPaymentIcon(sale.paymentMethod)}
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{sale.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 font-black text-2xl text-slate-900 tracking-tighter italic">
                                            <span className="text-xs text-slate-400 font-bold">$</span>
                                            {parseFloat(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:bg-indigo-600"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handlePrint(sale)}
                                                className="w-12 h-12 bg-white text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all hover:text-emerald-500"
                                            >
                                                <Printer size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredSales.length === 0 && (
                    <div className="py-48 text-center bg-white">
                        <FileText size={96} className="mx-auto text-slate-50 mb-8" />
                        <h4 className="text-4xl font-black text-slate-200 tracking-tighter uppercase italic">No Archives Found</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">No se detectaron registros para los criterios establecidos.</p>
                    </div>
                )}
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-4xl shadow-2xl relative border border-white/10 custom-scrollbar max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedSale(null)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                            <div>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Ticket Detail</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Transaction Log Index</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date-Time Stamp</span>
                                            <span className="text-sm font-black text-slate-900 italic">{new Date(selectedSale.date).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Node</span>
                                            <span className="text-sm font-black text-indigo-600 uppercase italic">{selectedSale.branch.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Operator</span>
                                            <span className="text-sm font-black text-slate-900 uppercase italic">{selectedSale.user?.name || 'Pos System'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer ID</span>
                                            <span className="text-sm font-black text-emerald-600 uppercase italic">{selectedSale.customer?.name || 'Public Desk'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 italic">Settlement Total</p>
                                <h2 className="text-7xl font-black tracking-tighter leading-none italic mb-10 flex items-start">
                                    <span className="text-2xl mt-2 text-emerald-400 opacity-60 mr-2">$</span>
                                    {parseFloat(selectedSale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase">
                                            <CheckCircle2 size={12} /> {selectedSale.status}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Method</p>
                                        <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase">
                                            {getPaymentIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePrint(selectedSale)}
                                    className="mt-10 w-full h-20 bg-emerald-600 text-white rounded-[1.75rem] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                                >
                                    <Printer size={24} /> Print Audit Copy
                                </button>
                            </div>
                        </div>

                        {/* Itemized Detail */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 italic">Itemized Manifest</h4>
                            <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100/50 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-6">SKU / Item Name</th>
                                            <th className="px-8 py-6 text-center">Qty</th>
                                            <th className="px-8 py-6 text-right">Unit Price</th>
                                            <th className="px-8 py-6 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/50">
                                        {selectedSale.details.map((detail) => (
                                            <tr key={detail.id}>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900 uppercase italic tracking-tighter">{detail.product.name}</p>
                                                    <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-1">{detail.product.code || 'NO-REF'}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="font-black text-slate-900 text-lg italic">{parseFloat(detail.quantity)}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{detail.product.unit}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-slate-600 italic">
                                                    ${parseFloat(detail.unitPrice).toFixed(2)}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="font-black text-slate-900 text-xl tracking-tighter italic">${parseFloat(detail.subtotal).toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
