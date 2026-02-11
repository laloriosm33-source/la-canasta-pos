import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    BarChart3,
    Download,
    Activity,
    Target,
    Calendar,
    PieChart as PieIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import api from '../services/api';
import { useStore } from '../context/StoreContext';
import toast, { Toaster } from 'react-hot-toast';

interface Sale {
    total: string;
    date: string;
    branchId: string;
    details: Array<{
        subtotal: string;
        product: {
            category?: { name: string }
        }
    }>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
    const { selectedBranchId } = useStore();
    const [sales, setSales] = useState<Sale[]>([]);
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/sales');
            setSales(res.data);
        } catch {
            toast.error('Error al sincronizar motor analítico');
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const filteredSales = useMemo(() => {
        let list = selectedBranchId === 'all' ? sales : sales.filter(s => s.branchId === selectedBranchId);

        const now = new Date();
        if (timeframe === 'daily') {
            list = list.filter(s => new Date(s.date).toDateString() === now.toDateString());
        } else if (timeframe === 'weekly') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            list = list.filter(s => new Date(s.date) >= oneWeekAgo);
        } else if (timeframe === 'monthly') {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            list = list.filter(s => new Date(s.date) >= oneMonthAgo);
        }
        return list;
    }, [sales, selectedBranchId, timeframe]);

    const totalRevenue = useMemo(() => filteredSales.reduce((acc, s) => acc + parseFloat(s.total), 0), [filteredSales]);
    const avgTicket = useMemo(() => filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0, [filteredSales, totalRevenue]);

    const salesChartData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredSales.forEach(s => {
            const date = new Date(s.date);
            const label = timeframe === 'daily' ? `${date.getHours()}:00` : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
            data[label] = (data[label] || 0) + parseFloat(s.total);
        });
        return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => timeframe === 'daily' ? parseInt(a.name) - parseInt(b.name) : 0);
    }, [filteredSales, timeframe]);

    const categoryData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredSales.forEach(s => {
            s.details.forEach(d => {
                const cat = d.product.category?.name || 'Varios';
                data[cat] = (data[cat] || 0) + parseFloat(d.subtotal);
            });
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [filteredSales]);

    return (
        <div className="space-y-12 animate-fade-in pb-20 font-sans">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic uppercase">Intelligence Center</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Análisis Profundo y Proyecciones de Crecimiento</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 h-16 bg-white text-slate-900 border border-slate-200 rounded-[1.75rem] font-black flex items-center gap-3 shadow-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest">
                        <Download size={18} /> Exportar Data (CSV)
                    </button>
                    <div className="flex gap-2 p-2 bg-slate-900 rounded-[1.75rem] shadow-2xl">
                        {['daily', 'weekly', 'monthly'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t as 'daily' | 'weekly' | 'monthly')}
                                className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {t === 'daily' ? 'Hoy' : t === 'weekly' ? '7 Días' : '30 Días'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <Activity className="text-indigo-400" size={24} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Volumen Operativo Consolidado</span>
                            </div>
                            <h3 className="text-7xl font-black tracking-tighter italic leading-none mb-4">
                                <span className="text-2xl text-indigo-400 opacity-60 mr-2">$</span>
                                {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Ingreso Bruto en el periodo seleccionado</p>
                        </div>
                        <div className="mt-20 flex gap-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Avg. Ticket</p>
                                <p className="text-3xl font-black italic tracking-tighter">${avgTicket.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Transactions</p>
                                <p className="text-3xl font-black italic tracking-tighter">{filteredSales.length}</p>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Forecast</p>
                                <p className="text-3xl font-black italic tracking-tighter text-emerald-400">Stable</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-10">
                            <Target className="text-emerald-500" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Quota fulfillment</span>
                        </div>
                        <div className="space-y-12">
                            <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic outline-none">Monthly goal</span>
                                    <span className="text-xs font-black text-indigo-600 italic">65%</span>
                                </div>
                                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-100 shadow-inner">
                                    <div style={{ width: "65%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Forecast</span>
                                    <span className="font-black text-emerald-500">+12.4%</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Basado en tendencias históricas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full h-20 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-indigo-500/20 italic mt-12">
                        View Detailed Forecast
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                            <BarChart3 size={24} className="text-indigo-600" />
                            <h4 className="text-2xl font-black tracking-tighter italic">Flux Capacity</h4>
                        </div>
                        <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl uppercase tracking-widest italic">Live Monitor</span>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                            <PieIcon size={24} className="text-emerald-600" />
                            <h4 className="text-2xl font-black tracking-tighter italic">Category Distribution</h4>
                        </div>
                        <Calendar size={20} className="text-slate-300" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex-1 w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/3 flex flex-col gap-4">
                            {categoryData.slice(0, 5).map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[80px]">{entry.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900">${entry.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
