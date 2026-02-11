import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Box,
    Users,
    Settings,
    LogOut,
    Building2,
    ArrowLeftRight,
    Truck,
    PieChart,
    ChevronRight,
    History,
    Wallet,
    BarChart3,
    type LucideIcon
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import api from '../services/api';

interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    required: string;
}

interface NavCategory {
    title: string;
    items: NavItem[];
}

interface Branch {
    id: string;
    name: string;
}

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedBranchId, setSelectedBranchId } = useStore();
    const [branches, setBranches] = useState<Branch[]>([]);

    const isActive = (path: string) => location.pathname === path;

    const user = useMemo(() => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }, []);

    const permissions: string[] = useMemo(() => {
        return user?.permissions ? user.permissions.split(',') : ['POS'];
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const res = await api.get('/branches');
                if (isMounted) {
                    setBranches(res.data);
                    if (user?.role !== 'ADMIN' && user?.branchId) {
                        setSelectedBranchId(user.branchId);
                    }
                }
            } catch {
                console.error('Error fetching branches');
            }
        };
        load();
        return () => { isMounted = false; };
    }, [setSelectedBranchId, user?.role, user?.branchId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const categories: NavCategory[] = [
        {
            title: 'Core Operations',
            items: [
                { path: '/', icon: LayoutDashboard, label: 'Panel de Control', required: 'POS' },
                { path: '/reports', icon: BarChart3, label: 'Reportes y Estadísticas', required: 'POS' },
                { path: '/pos', icon: ShoppingBag, label: 'Terminal de Ventas', required: 'POS' },
                { path: '/sales', icon: History, label: 'Archivo de Auditoría', required: 'POS' },
            ]
        },
        {
            title: 'Suministros y Logística',
            items: [
                { path: '/products', icon: Box, label: 'Catálogo Maestro', required: 'INVENTORY' },
                { path: '/inventory', icon: PieChart, label: 'Gestión de Stock', required: 'INVENTORY' },
                { path: '/transfers', icon: ArrowLeftRight, label: 'Traspasos entre Sucursales', required: 'INVENTORY' },
                { path: '/providers', icon: Truck, label: 'Gestión de Proveedores', required: 'INVENTORY' },
            ]
        },
        {
            title: 'Gestión de Clientes',
            items: [
                { path: '/customers', icon: Users, label: 'Cartera de Clientes', required: 'CUSTOMERS' },
            ]
        },
        {
            title: 'Control Financiero',
            items: [
                { path: '/finances', icon: Wallet, label: 'Gestión de Caja', required: 'SETTINGS' },
            ]
        },
        {
            title: 'Administración de Sistema',
            items: [
                { path: '/users', icon: Users, label: 'Control de Usuarios', required: 'USERS' },
                { path: '/branches', icon: Building2, label: 'Red de Sucursales', required: 'SETTINGS' },
                { path: '/settings', icon: Settings, label: 'Parámetros Globales', required: 'SETTINGS' },
            ]
        }
    ];

    return (
        <div className="h-screen w-80 bg-[#0F172A] text-white flex flex-col border-r border-white/5 shadow-[24px_0_48px_-12px_rgba(0,0,0,0.5)] relative z-50 shrink-0 font-sans">
            {/* Header / Brand */}
            <div className="p-10 pb-6">
                <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-16 h-16 rounded-[1.25rem] shadow-2xl shadow-emerald-500/20 group-hover:scale-105 transition-all duration-500 overflow-hidden bg-white">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white leading-none italic uppercase">Canasta</h1>
                        <span className="text-[10px] font-black tracking-[0.5em] text-emerald-500 uppercase opacity-60">Enterprise</span>
                    </div>
                </div>

                {user && (
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 mb-8 space-y-6 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-white shadow-2xl text-xl italic">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-base font-black text-white truncate leading-none mb-1 italic uppercase tracking-tighter">{user.name}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Global Branch Selector */}
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 size={12} className="text-indigo-400" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Node Context</span>
                            </div>
                            <div className="relative">
                                <select
                                    disabled={user?.role !== 'ADMIN'}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 appearance-none cursor-pointer transition-all hover:bg-slate-800"
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                >
                                    <option value="all">Global Visibility</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-500" size={14} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 overflow-y-auto custom-scrollbar pb-10 space-y-10">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-4">
                        <p className="px-4 text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.4em] italic flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                             {cat.title}
                        </p>
                        <div className="space-y-1.5">
                            {cat.items.filter((item) => user?.role === 'ADMIN' || permissions.includes(item.required)).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center justify-between group px-5 py-4 rounded-[1.25rem] transition-all duration-500 relative overflow-hidden ${active
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/20 scale-[1.02]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10 w-full">
                                            <item.icon size={22} className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} transition-colors duration-500`} />
                                            <span className="font-black text-xs uppercase tracking-widest italic flex-1">{item.label}</span>
                                            {!active && <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />}
                                            {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-8 mt-auto border-t border-white/5 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 group w-full py-5 bg-rose-500/5 hover:bg-rose-600 rounded-2xl border border-rose-500/10 transition-all duration-500 text-rose-500 hover:text-white shadow-2xl hover:shadow-rose-600/30"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Terminate Session</span>
                </button>
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.5em]">System Core v1.4.2</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

