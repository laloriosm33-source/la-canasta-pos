import React, { useState, useEffect } from 'react';
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
    Store,
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

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedBranchId, setSelectedBranchId } = useStore();
    const [branches, setBranches] = useState<Branch[]>([]);

    const isActive = (path: string) => location.pathname === path;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const permissions: string[] = user?.permissions ? user.permissions.split(',') : ['POS'];


    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get('/branches');
                setBranches(res.data);

                // For regular users, force their assigned branch
                if (user?.role !== 'ADMIN' && user?.branchId) {
                    setSelectedBranchId(user.branchId);
                }
            } catch (err) {
                console.error('Error fetching branches:', err);
            }
        };

        fetchBranches();
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
        <div className="h-screen w-72 bg-[#0F172A] text-white flex flex-col border-r border-white/5 shadow-[24px_0_48px_-12px_rgba(0,0,0,0.5)] relative z-50 shrink-0 font-sans">
            {/* Header / Brand */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                            }}
                        />
                        <Store className="text-emerald-600 hidden" size={32} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white leading-none">LA CANASTA</h1>
                        <span className="text-[8px] font-bold tracking-[0.3em] text-emerald-400 uppercase opacity-60">ERP System</span>
                    </div>
                </div>

                {user && (
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-3 border border-white/10 mb-6 space-y-3 shadow-inner">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-white shadow-lg text-xs">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{user.name}</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider truncate">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Global Branch Selector */}
                        <div className="pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1 mb-1.5">
                                <Building2 size={9} className="text-indigo-400" />
                                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Sucursal Activa</span>
                            </div>
                            <div className="relative">
                                <select
                                    disabled={user?.role !== 'ADMIN'}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 appearance-none cursor-pointer transition-all hover:bg-slate-800"
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                >
                                    <option value="all">Todas las Sucursales</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" size={10} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar pb-6 space-y-6">
                {categories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                        <p className="px-3 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{cat.title}</p>
                        <div className="space-y-1">
                            {cat.items.filter((item) => user?.role === 'ADMIN' || permissions.includes(item.required)).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 group px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${active
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                            active 
                                                ? 'bg-white/10' 
                                                : 'bg-slate-800/50 group-hover:bg-emerald-500/10'
                                        }`}>
                                            <item.icon size={16} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                                        </div>
                                        <span className="font-bold text-[10px] uppercase tracking-wide flex-1">{item.label}</span>
                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto border-t border-white/5 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 group w-full py-3 bg-rose-500/5 hover:bg-rose-600 rounded-xl border border-rose-500/10 transition-all duration-300 text-rose-500 hover:text-white shadow-lg hover:shadow-rose-600/30"
                >
                    <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-bold text-[9px] uppercase tracking-wider">Cerrar Sesión</span>
                </button>
                <div className="mt-3 flex justify-center">
                    <div className="px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg">
                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-[0.3em]">v1.4.2</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-fixed custom-scrollbar">
                <div className="max-w-[1400px] mx-auto p-8 md:p-12 min-h-screen">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                        {children}
                    </div>
                </div>

                {/* Global Aura / Background accents */}
                <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.03] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="fixed bottom-0 left-72 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                <div className="fixed top-1/2 left-1/2 w-[800px] h-[800px] bg-slate-500/[0.01] blur-[200px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            </main>
        </div>
    );
};
