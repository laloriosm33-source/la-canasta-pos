import { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Box, Store, ArrowUpRight, ArrowDownRight, Activity, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { useStore } from '../context/StoreContext';

interface Sale {
    id: string;
    total: string;
    paymentMethod: string;
    date: string;
    branchId: string;
}

interface Customer {
    id: string;
    name: string;
    branchId: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: LucideIcon;
    color: string;
    trend?: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, color, trend }: StatCardProps) => (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color} group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={28} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            )}
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
        </div>

        {/* Decorative element */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
    </div>
);

const Dashboard = () => {
    const { selectedBranchId } = useStore();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [salesRes, custRes] = await Promise.all([
                api.get('/sales'),
                api.get('/customers')
            ]);
            setAllSales(salesRes.data);
            setAllCustomers(custRes.data);
        } catch {
            console.error("Dashboard error");
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const filteredSales = useMemo(() => {
        return selectedBranchId === 'all'
            ? allSales
            : allSales.filter(s => s.branchId === selectedBranchId);
    }, [selectedBranchId, allSales]);

    const filteredCustomers = useMemo(() => {
        return selectedBranchId === 'all'
            ? allCustomers
            : allCustomers.filter(c => c.branchId === selectedBranchId);
    }, [selectedBranchId, allCustomers]);

    const stats = useMemo(() => {
        const totalSales = filteredSales.reduce((acc: number, sale: Sale) => acc + parseFloat(sale.total), 0);
        const orderCount = filteredSales.length;
        const customerCount = filteredCustomers.length;
        const recentSales = [...filteredSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
        
        return {
            totalSales,
            orderCount,
            customerCount,
            recentSales
        };
    }, [filteredSales, filteredCustomers]);

    const user = useMemo(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }, []);

    return (
        <div className="space-y-10">
            {/* Header with Glassmorphism */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Intelligence Node</h2>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/20">Real Time</span>
                        <p className="text-slate-500 font-bold text-sm tracking-tight capitalize">Bienvenido, <span className="text-slate-900">{user?.name}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl shadow-slate-200/50">
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm flex items-center gap-3">
                        <Activity size={18} className="text-emerald-500" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">Sincronización Activa</span>
                    </div>
                    <Button variant="primary" className="!rounded-xl px-6 font-black h-11" onClick={fetchData}>Sync Now</Button>
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Volumen de Ventas"
                    value={`$${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="bg-[#0F172A]"
                    change="12.5%"
                    trend="up"
                />
                <StatCard
                    title="Pedidos Procesados"
                    value={stats.orderCount}
                    icon={ShoppingBag}
                    color="bg-emerald-600"
                    change="5 new"
                    trend="up"
                />
                <StatCard
                    title="Base de Usuarios"
                    value={stats.customerCount}
                    icon={Users}
                    color="bg-blue-600"
                    change="0.8%"
                    trend="down"
                />
                <StatCard
                    title="Ticket Promedio"
                    value={`$${stats.orderCount > 0 ? (stats.totalSales / stats.orderCount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}`}
                    icon={TrendingUp}
                    color="bg-violet-600"
                    change="4.2%"
                    trend="up"
                />
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Visual Chart / Recent Activity Placeholder */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic">Live Stream</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Flujo de caja en tiempo real</p>
                            </div>
                            <Link to="/pos">
                                <Button variant="ghost" size="sm" className="text-emerald-600 font-black tracking-widest uppercase text-[9px] hover:bg-emerald-50 border border-emerald-100">Nueva Venta</Button>
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-50 font-sans">
                            {stats.recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-7 hover:bg-slate-50/50 transition-all cursor-pointer group">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-sm">
                                            <DollarSign size={28} className="text-slate-400 group-hover:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors text-xl tracking-tighter leading-none mb-1">TXN-{sale.id.slice(0, 6).toUpperCase()}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest leading-none">{sale.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-3xl text-slate-900 group-hover:scale-105 transition-transform tracking-tight leading-none">${parseFloat(sale.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            {stats.recentSales.length === 0 && (
                                <div className="text-center py-32 px-10">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-50">
                                        <Box size={44} className="text-slate-200" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Sin operaciones registradas</h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Esperando flujo de transacciones...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column / Quick Access & Tools */}
                <div className="space-y-10">
                    {/* POS Promotion Card */}
                    <div className="bg-[#0F172A] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                        {/* Decorative Background Accents */}
                        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-1000"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/5 shadow-2xl">
                                <Activity className="text-emerald-400" size={32} />
                            </div>
                            <h4 className="font-black text-4xl mb-3 tracking-tighter leading-none italic">Terminal POS</h4>
                            <p className="text-slate-400 mb-12 font-bold text-sm tracking-tight opacity-70 leading-relaxed uppercase tracking-tighter">Entorno de ventas de alta velocidad optimizado para touch.</p>

                            <Link to="/pos">
                                <Button className="w-full h-20 !rounded-[1.75rem] bg-emerald-500 border-none text-slate-900 font-black text-xl hover:bg-emerald-400 shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter">
                                    Vincular Terminal
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-50 shadow-2xl shadow-slate-200/30">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 ml-2 italic">Accesos Rápidos</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { to: '/inventory', label: 'Explorar Kardex', icon: Box, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
                                { to: '/products', label: 'Catálogo Maestro', icon: Store, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                                { to: '/customers', label: 'Base de Clientes', icon: Users, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                            ].map((item, idx) => (
                                <Link key={idx} to={item.to} className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} border group-hover:scale-110 transition-transform shadow-sm`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className="font-black text-slate-800 text-sm tracking-tight italic">{item.label}</span>
                                    </div>
                                    <ArrowUpRight size={20} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
