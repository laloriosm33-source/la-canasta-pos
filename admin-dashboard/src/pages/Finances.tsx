import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    X,
    DollarSign
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useStore } from '../context/StoreContext';

interface CashMovement {
    id: string;
    type: 'IN' | 'OUT';
    amount: string;
    reason: string;
    date: string;
    user: { name: string };
    branch: { name: string };
}

interface Shift {
    id: string;
    startTime: string;
    endTime: string | null;
    initialCash: string;
    finalCashActual: string | null;
    user: { name: string };
}

interface Expense {
    id: string;
    amount: string;
    description: string;
    category: string;
    date: string;
    branch: { name: string };
}

const Finances = () => {
    const { selectedBranchId } = useStore();
    const [movements, setMovements] = useState<CashMovement[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    interface SystemLog {
        id: string;
        date: string;
        action: string;
        details?: string;
        user?: { name: string };
    }

    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [activeTab, setActiveTab] = useState<'MOVEMENTS' | 'SHIFTS' | 'EXPENSES' | 'AUDIT'>('MOVEMENTS');

    // Form States
    const [movementData, setMovementData] = useState({ type: 'IN', amount: '', reason: '', branchId: '' });
    const [expenseData, setExpenseData] = useState({ amount: '', description: '', category: 'General', branchId: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const query = selectedBranchId !== 'all' ? `?branchId=${selectedBranchId}` : '';
            const [mRes, sRes, eRes, logRes] = await Promise.all([
                api.get(`/finance/movements${query}`),
                api.get(`/finance/shifts${query}`),
                api.get(`/finance/expenses${query}`),
                api.get(`/system/logs${query}`)
            ]);
            setMovements(mRes.data);
            setShifts(sRes.data);
            setExpenses(eRes.data);
            setLogs(logRes.data);
        } catch {
            toast.error('Error al sincronizar datos financieros');
        } finally {
            setLoading(false);
        }
    }, [selectedBranchId]);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData, selectedBranchId]);

    const handleMovementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBranchId === 'all') return toast.error('Selecciona una sucursal específica');
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await api.post('/finance/movements', {
                ...movementData,
                amount: parseFloat(movementData.amount),
                branchId: selectedBranchId,
                userId: user.id
            });
            toast.success('Movimiento registrado satisfactoriamente');
            setIsMovementModalOpen(false);
            setMovementData({ type: 'IN', amount: '', reason: '', branchId: '' });
            fetchData();
        } catch {
            toast.error('Error al procesar flujo de caja');
        }
    };

    const handleCloseShift = async (shiftId: string) => {
        const finalCash = prompt("Ingrese el total de efectivo en caja para el cierre (Arqueo):");
        if (finalCash === null) return;

        try {
            await api.post(`/finance/shifts/${shiftId}/close`, {
                finalCashActual: parseFloat(finalCash)
            });
            toast.success('Turno cerrado y sincronizado');
            fetchData();
        } catch {
            toast.error('Error al cerrar el turno');
        }
    };

    const handleExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBranchId === 'all') return toast.error('Selecciona una sucursal específica');
        try {
            await api.post('/finance/expenses', {
                ...expenseData,
                amount: parseFloat(expenseData.amount),
                branchId: selectedBranchId
            });
            toast.success('Gasto operativo registrado');
            setIsExpenseModalOpen(false);
            setExpenseData({ amount: '', description: '', category: 'General', branchId: '' });
            fetchData();
        } catch {
            toast.error('Error al registrar gasto');
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic uppercase">Financial Core</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Gestión de activos, flujos y auditoría operativa.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsMovementModalOpen(true)}
                        className="px-8 h-16 bg-slate-900 text-white rounded-[1.75rem] font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all text-[11px] uppercase tracking-[0.2em]"
                    >
                        <Plus size={20} /> Flujo de Caja
                    </button>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="px-8 h-16 bg-white text-slate-900 border-2 border-slate-900/5 rounded-[1.75rem] font-black flex items-center gap-3 shadow-xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-[0.2em]"
                    >
                        <TrendingDown size={20} className="text-rose-500" /> Registrar Gasto
                    </button>
                </div>
            </header>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { title: 'Capital Neto', value: movements.reduce((acc, m) => acc + (m.type === 'IN' ? parseFloat(m.amount) : -parseFloat(m.amount)), 0), icon: Wallet, color: 'emerald' },
                    { title: 'Entradas Brutas', value: movements.filter(m => m.type === 'IN').reduce((acc, m) => acc + parseFloat(m.amount), 0), icon: ArrowUpRight, color: 'indigo' },
                    { title: 'Salidas / Retiros', value: movements.filter(m => m.type === 'OUT').reduce((acc, m) => acc + parseFloat(m.amount), 0), icon: ArrowDownRight, color: 'rose' },
                    { title: 'Gasto Operativo', value: expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0), icon: TrendingDown, color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-3xl group-hover:bg-slate-500/10 transition-all"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <stat.icon size={20} className="text-slate-900" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">
                            <span className="text-xs text-slate-300 mr-1">$</span>
                            {stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100 p-2 rounded-[2rem] shadow-inner">
                <button onClick={() => setActiveTab('MOVEMENTS')} className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'MOVEMENTS' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Movimientos</button>
                <button onClick={() => setActiveTab('SHIFTS')} className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'SHIFTS' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Cortes</button>
                <button onClick={() => setActiveTab('EXPENSES')} className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Gastos</button>
                <button onClick={() => setActiveTab('AUDIT')} className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'AUDIT' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Auditoría</button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] border-b border-slate-50">
                            <tr>
                                <th className="px-10 py-8 italic">Referencia / Fecha</th>
                                <th className="px-10 py-8 italic">Categoría / Razón</th>
                                <th className="px-10 py-8 italic">Nodo / Operador</th>
                                <th className="px-10 py-8 italic text-right">Net Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activeTab === 'MOVEMENTS' && movements.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 italic uppercase tracking-tighter mb-1">{new Date(m.date).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-mono text-slate-400 font-bold tracking-widest">TRX-{m.id.slice(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${m.type === 'IN' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'}`}></div>
                                            <span className="font-black text-slate-800 uppercase italic text-xs truncate max-w-[200px]">{m.reason}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{m.branch.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{m.user.name}</p>
                                        </div>
                                    </td>
                                    <td className={`px-10 py-8 text-right font-black text-2xl italic tracking-tighter ${m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {m.type === 'IN' ? '+' : '-'}${parseFloat(m.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'SHIFTS' && shifts.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 italic uppercase tracking-tighter mb-1">{new Date(s.startTime).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-mono text-slate-400 font-bold tracking-widest">{new Date(s.startTime).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${s.endTime ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {s.endTime ? 'Sincronizado' : 'En Sesión'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{s.user.name}</p>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            {!s.endTime ? (
                                                <button
                                                    onClick={() => handleCloseShift(s.id)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-slate-200"
                                                >
                                                    Finalizar Turno
                                                </button>
                                            ) : (
                                                <>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Cierre Final</p>
                                                    <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">
                                                        ${s.finalCashActual ? parseFloat(s.finalCashActual).toLocaleString() : '---'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'EXPENSES' && expenses.map((e) => (
                                <tr key={e.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 italic uppercase tracking-tighter mb-1">{new Date(e.date).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-mono text-slate-400 font-bold tracking-widest">EXP-{e.id.slice(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm border border-rose-100 italic">{e.category}</span>
                                        <p className="mt-2 font-black text-xs text-slate-800 uppercase italic opacity-70">{e.description}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{e.branch.name}</p>
                                    </td>
                                    <td className="px-10 py-8 text-right font-black text-2xl text-rose-500 italic tracking-tighter">
                                        -${parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {activeTab === 'AUDIT' && (
                            <tbody className="divide-y divide-slate-50 italic">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-10 py-8 italic font-bold">
                                            <p className="text-sm text-slate-900">{new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest">{log.action}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-slate-800">{log.details || '---'}</p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <p className="text-[10px] font-black text-slate-900 uppercase italic">{log.user?.name || 'System'}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                {loading && (
                    <div className="py-20 text-center uppercase font-black text-slate-300 italic tracking-widest animate-pulse">Sincronizando Libro Mayor...</div>
                )}
            </div>

            {/* Modal Components */}
            {isMovementModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white/10">
                        <button onClick={() => setIsMovementModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <Wallet size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Cash Flow</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Sincronización de Recursos Inmediatos</p>
                            </div>
                        </div>

                        <form onSubmit={handleMovementSubmit} className="space-y-12">
                            <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] shadow-inner border border-slate-100">
                                {['IN', 'OUT'].map((t) => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setMovementData({ ...movementData, type: t })}
                                        className={`flex-1 py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${movementData.type === t ? (t === 'IN' ? 'bg-emerald-500 text-white shadow-xl' : 'bg-rose-500 text-white shadow-xl') : 'text-slate-400'
                                            }`}
                                    >
                                        {t === 'IN' ? 'Entrada / Depósito' : 'Salida / Retiro'}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Importe Monetario</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
                                    <input required type="number" step="any" className="w-full pl-24 pr-10 py-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-5xl shadow-inner placeholder:text-slate-100"
                                        value={movementData.amount} onChange={e => setMovementData({ ...movementData, amount: e.target.value })}
                                        placeholder="00.00" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Justificación / Razón</label>
                                <input required className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-bold text-slate-900 text-xl shadow-inner"
                                    value={movementData.reason} onChange={e => setMovementData({ ...movementData, reason: e.target.value })}
                                    placeholder="Especifique el motivo del flujo..." />
                            </div>

                            <button type="submit" className="w-full h-24 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                Ejecutar Sincronización
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl relative border border-white/10">
                        <button onClick={() => setIsExpenseModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-rose-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-rose-600/30">
                                <TrendingDown size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Expense Hub</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Control de Egresos Operativos</p>
                            </div>
                        </div>

                        <form onSubmit={handleExpenseSubmit} className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Costo Operativo</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
                                    <input required type="number" step="any" className="w-full pl-24 pr-10 py-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-5xl shadow-inner placeholder:text-slate-100"
                                        value={expenseData.amount} onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })}
                                        placeholder="00.00" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Clasificación</label>
                                    <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-xl outline-none shadow-inner cursor-pointer"
                                        value={expenseData.category} onChange={e => setExpenseData({ ...expenseData, category: e.target.value })}>
                                        <option>General</option>
                                        <option>Servicios</option>
                                        <option>Renta</option>
                                        <option>Nómina</option>
                                        <option>Mantenimiento</option>
                                        <option>Insumos</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Descripción / Concepto</label>
                                    <input required className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-bold text-slate-900 text-xl shadow-inner"
                                        value={expenseData.description} onChange={e => setExpenseData({ ...expenseData, description: e.target.value })}
                                        placeholder="Descripción detallada del egreso..." />
                                </div>
                            </div>

                            <button type="submit" className="w-full h-24 bg-rose-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                Registrar Egreso
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finances;
