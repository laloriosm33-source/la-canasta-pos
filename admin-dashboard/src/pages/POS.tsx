import { useState, useEffect, useCallback, useMemo } from 'react';

// ... (skipping some code if needed, but replace_file_content needs exact match)
// Actually I'll do it in chunks.
// First fix the import.

import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Banknote,
    User,
    CreditCard,
    Smartphone,
    FolderOpen,
    X,
    CheckCircle2,
    Activity
} from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { printReceipt } from '../utils/printer';
import { useStore } from '../context/StoreContext';

// --- Interfaces ---
interface Inventory { quantity: string; branchId: string; }
interface Category { id: string; name: string; }
interface Product {
    id: string;
    name: string;
    code?: string;
    priceRetail?: string;
    categoryId?: string;
    inventory?: Inventory[];
    unit?: string;
}
interface CartItem extends Product {
    quantity: number;
    finalPrice: number;
}
interface Customer { id: string; name: string; currentBalance: string; }

interface SavedTicket {
    id: string;
    name: string;
    cart: CartItem[];
    customer: Customer | null;
    timestamp: number;
}

interface Shift {
    id: string;
    userId: string;
    startTime: string;
    endTime?: string;
    initialCash: number;
}

const POS = () => {
    const { selectedBranchId } = useStore();

    // --- Data State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // --- Cart & Selling State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CREDIT'>('CASH');
    const [globalDiscount] = useState<number>(0);

    // --- UI State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [currentQty, setCurrentQty] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);

    // --- Manual Price Modal ---
    const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
    const [manualPrice, setManualPrice] = useState('');
    const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
    const [manualQty, setManualQty] = useState('1');

    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [initialCash, setInitialCash] = useState('0');
    const [businessInfo, setBusinessInfo] = useState({ name: 'LA CANASTA', address: '' });

    const user = useMemo(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : {};
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.businessName) {
                setBusinessInfo({
                    name: res.data.businessName,
                    address: res.data.address || ''
                });
            }
        } catch { console.error("Error fetching settings for POS"); }
    }, []);

    const handleOpenShift = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/finance/shifts/open', {
                initialCash: parseFloat(initialCash),
                branchId: selectedBranchId
            });
            setActiveShift(res.data);
            setShowShiftModal(false);
            toast.success("Turno abierto con éxito");
        } catch {
            toast.error("Error al abrir el turno");
        }
    };

    const fetchInitialData = useCallback(async () => {
        try {
            const [prodRes, catRes, custRes, shiftRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/customers'),
                api.get('/finance/shifts')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setCustomers(custRes.data);

            const myOpenShift = shiftRes.data.find((s: Shift) => s.userId === user.id && !s.endTime);
            if (myOpenShift) {
                setActiveShift(myOpenShift);
            } else {
                setShowShiftModal(true);
            }
        } catch {
            toast.error("Error al sincronizar datos del catálogo.");
        }
    }, [user.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInitialData();
            fetchSettings();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchInitialData, fetchSettings]);

    useEffect(() => {
        const saved = localStorage.getItem('pos_tickets');
        if (saved) {
            try {
                setSavedTickets(JSON.parse(saved));
            } catch {
                console.error("Error parsing saved tickets");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pos_tickets', JSON.stringify(savedTickets));
    }, [savedTickets]);

    const getStockInCurrentBranch = (product: Product): number => {
        if (!product.inventory) return 0;
        if (selectedBranchId === 'all') {
            return product.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0);
        }
        const branchStock = product.inventory.find(i => i.branchId === selectedBranchId);
        return branchStock ? Number(branchStock.quantity) : 0;
    };

    const addToCart = (product: Product, price: number, qty: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.finalPrice === price);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.finalPrice === price)
                        ? { ...item, quantity: item.quantity + qty } : item
                );
            }
            return [...prev, { ...product, quantity: qty, finalPrice: price }];
        });
        setSearchTerm('');
        toast.success(`${product.name} agregado`, { duration: 800, icon: '🛒' });
    };

    const handleAddToCart = (product: Product) => {
        const price = product.priceRetail ? parseFloat(product.priceRetail) : 0;
        if (price <= 0) {
            setPendingProduct(product);
            setManualPrice('');
            setManualQty(currentQty.toString());
            return;
        }

        const stock = getStockInCurrentBranch(product);
        if (stock <= 0) {
            toast.error(`Sin existencia de "${product.name}" en esta sucursal.`);
            return;
        }

        addToCart(product, price, currentQty);
        setCurrentQty(1);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const total = subtotal * (1 - globalDiscount / 100);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (selectedBranchId === 'all') {
            toast.error("Por favor selecciona una sucursal específica en la barra lateral antes de cobrar.");
            return;
        }
        if (paymentMethod === 'CREDIT' && !selectedCustomer) {
            toast.error("Seleccione un cliente para asignar la cuenta fiada.");
            return;
        }

        setLoading(true);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};

        const payload = {
            branchId: selectedBranchId,
            userId: user.id || null,
            shiftId: activeShift?.id || null,
            customerId: selectedCustomer?.id || null,
            total: subtotal * (1 - globalDiscount / 100),
            paymentMethod,
            details: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.finalPrice,
                subtotal: item.finalPrice * item.quantity
            }))
        };

        try {
            const res = await api.post('/sales', payload);
            toast.success("¡Venta completada!", { icon: '✅', style: { borderRadius: '20px', background: '#0F172A', color: '#fff', fontWeight: 'black' } });

            // Thermal Print
            printReceipt({
                businessName: businessInfo.name,
                address: businessInfo.address || ('Sucursal ' + selectedBranchId.slice(0, 8).toUpperCase()),
                date: new Date().toLocaleString(),
                orderId: res.data.id || 'N/A',
                items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.finalPrice, total: i.finalPrice * i.quantity })),
                total: payload.total,
                cashier: user.name || 'Cajero'
            });

            setCart([]);
            setSelectedCustomer(null);
            setPaymentMethod('CASH');
            fetchInitialData(); // Refresh stock
        } catch {
            toast.error("Error crítico al procesar el pago.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pendingProduct) {
            addToCart(pendingProduct, parseFloat(manualPrice), parseFloat(manualQty));
            setPendingProduct(null);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code?.includes(searchTerm);
        const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-8 antialiased font-sans">
            <Toaster position="top-right" />

            {/* --- CATALOG COLUMN --- */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Search & Categories */}
                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col gap-8">
                    <div className="flex gap-4">
                        <div className="w-32 shrink-0">
                            <input
                                type="number" step="0.01" min="0.01"
                                className="w-full px-6 py-5 bg-slate-900 text-white border-none rounded-[1.75rem] focus:ring-8 focus:ring-emerald-500/20 font-black text-center text-3xl shadow-2xl"
                                value={currentQty}
                                onChange={e => setCurrentQty(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={28} />
                            <input
                                type="text"
                                placeholder="Escanear SKU o filtrar por nombre..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.75rem] focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 transition-all text-xl font-black placeholder-slate-200 shadow-inner italic"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {['ALL', ...categories.map(c => c.id)].map(catId => {
                            const cat = categories.find(c => c.id === catId);
                            const label = catId === 'ALL' ? 'Catálogo Completo' : cat?.name;
                            const active = selectedCategory === catId;
                            return (
                                <button
                                    key={catId}
                                    onClick={() => setSelectedCategory(catId)}
                                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap
                                    ${active ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pr-2 custom-scrollbar content-start">
                    {filteredProducts.map(product => {
                        const stock = getStockInCurrentBranch(product);
                        const isOutOfStock = stock <= 0;
                        return (
                            <div
                                key={product.id}
                                onClick={() => !isOutOfStock && handleAddToCart(product)}
                                className={`bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 cursor-pointer relative group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 active:scale-95
                                ${isOutOfStock ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                            >
                                <div className="h-full flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <h3 className="font-black text-slate-900 leading-none line-clamp-2 text-sm uppercase tracking-tighter truncate">{product.name}</h3>
                                        <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">REF: {product.code || 'NO-SKU'}</span>
                                    </div>

                                    <div className="mt-8 flex justify-between items-end">
                                        <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${stock <= 5 ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {stock} {product.unit || 'UNIT'}
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter italic">
                                            <span className="text-[10px] mr-1 text-slate-400 font-bold">$</span>{product.priceRetail || '0.00'}
                                        </span>
                                    </div>
                                </div>
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[2.5rem]">
                                        <span className="bg-rose-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">Agotado</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- BILLING COLUMN --- */}
            <div className="w-[480px] bg-white rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative shadow-slate-300/40">

                {/* Header Section */}
                <div className="p-10 pb-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex-1 mr-4">
                            <User size={18} className="text-indigo-500" />
                            <select
                                className="bg-transparent text-[11px] font-black text-slate-800 outline-none cursor-pointer uppercase tracking-widest w-full"
                                value={selectedCustomer?.id || ''}
                                onChange={e => setSelectedCustomer(customers.find(x => x.id === e.target.value) || null)}
                            >
                                <option value="">Mostrador (Normal)</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowTicketModal(true)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-xl transition-all relative">
                                <FolderOpen size={20} />
                                {savedTickets.length > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-4 border-white shadow-lg">{savedTickets.length}</span>}
                            </button>
                            <button onClick={() => cart.length > 0 && setSelectedCustomer(null) || setCart([])} className="w-12 h-12 bg-white border border-slate-100 text-rose-300 hover:text-rose-600 rounded-2xl flex items-center justify-center hover:shadow-xl transition-all">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0F172A] rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/30">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4 ml-1">Grand Total</p>
                        <h1 className="text-7xl font-black tracking-tighter leading-none flex items-start italic">
                            <span className="text-2xl mt-2 text-emerald-400 opacity-80 mr-1">$</span>
                            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h1>
                        <div className="mt-8 flex items-center gap-3">
                            <span className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white/50 border border-white/5">Batch: {cart.length}</span>
                            <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/10">Active Terminal</span>
                        </div>
                    </div>
                </div>

                {/* Cart List */}
                <div className="flex-1 overflow-y-auto px-10 space-y-6 custom-scrollbar">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group animate-in slide-in-from-right-4 duration-300">
                            <div className="flex-1 pr-6">
                                <p className="font-black text-slate-800 truncate text-sm uppercase tracking-tighter italic">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
                                    {item.quantity} {item.unit || 'U'} <span className="mx-1 text-slate-200">/</span> ${item.finalPrice.toFixed(2)}
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-black text-slate-900 text-xl tracking-tighter italic">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => {
                                        setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it));
                                    }} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Minus size={14} /></button>
                                    <button onClick={() => {
                                        setCart(prev => prev.filter((_, i) => i !== idx));
                                    }} className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><X size={14} /></button>
                                    <button onClick={() => {
                                        setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                                    }} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-20">
                            <ShoppingCart size={120} strokeWidth={1} />
                            <p className="font-black text-2xl mt-8 tracking-[0.5em] uppercase italic">Await Entry</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-slate-50/50 backdrop-blur-md border-t border-slate-100 space-y-8 relative z-10">
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'CASH', label: 'Efectivo', icon: Banknote, active: paymentMethod === 'CASH' },
                            { id: 'TRANSFER', label: 'Transf.', icon: Smartphone, active: paymentMethod === 'TRANSFER' },
                            { id: 'CREDIT', label: 'Fiado', icon: CreditCard, active: paymentMethod === 'CREDIT' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => (m.id === 'CREDIT' && !selectedCustomer) ? toast.error('Selecciona el Cliente para el Crédito') : setPaymentMethod(m.id as 'CASH' | 'TRANSFER' | 'CREDIT')}
                                className={`relative p-5 rounded-[2rem] border-2 transition-all duration-700 flex flex-col items-center gap-3 overflow-hidden group/btn
                                ${m.active ? 'border-indigo-500 bg-white shadow-2xl scale-[1.05]' : 'border-slate-100 text-slate-400 bg-white/50 hover:border-slate-300'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${m.active ? 'bg-slate-900 text-white rotate-6' : 'bg-slate-50 group-hover/btn:rotate-12'}`}>
                                    <m.icon size={24} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{m.label}</span>
                                {m.active && <CheckCircle2 size={16} className="absolute top-4 right-4 text-emerald-500 animate-in zoom-in-0 duration-500" />}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full h-28 bg-[#0F172A] text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-10 disabled:opacity-50 disabled:scale-100 disabled:grayscale group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-left relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-1">Finalize Checkout</p>
                            <span className="font-black text-4xl tracking-tighter uppercase italic">Confirmar</span>
                        </div>
                        {loading ? (
                            <Activity className="animate-spin text-emerald-400" size={40} />
                        ) : (
                            <div className="w-16 h-16 bg-white/5 rounded-[1.25rem] flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all border border-white/5 relative z-10">
                                <ShoppingCart size={32} className="text-emerald-400 group-hover:text-white" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Background Decorative Accents */}
            <div className="fixed top-20 right-20 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
            <div className="fixed -bottom-20 -left-20 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>


            {/* Saved Tickets Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] border border-white/10">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-6 italic"><FolderOpen size={48} className="text-indigo-500" /> Pending Orders</h3>
                            <button onClick={() => setShowTicketModal(false)} className="p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={32} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
                            {savedTickets.length === 0 ? (
                                <div className="py-24 text-center">
                                    <ShoppingCart size={96} className="mx-auto text-slate-50 mb-8" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">All sessions cleared</p>
                                </div>
                            ) : (
                                savedTickets.map(t => (
                                    <div key={t.id} onClick={() => {
                                        setCart(t.cart);
                                        setSelectedCustomer(t.customer);
                                        setSavedTickets(prev => prev.filter(x => x.id !== t.id));
                                        setShowTicketModal(false);
                                    }} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group animate-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="font-black text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{t.name}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{t.customer?.name || 'Mostrador Anónimo'}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 italic uppercase bg-white px-3 py-1 rounded-lg shadow-sm">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{t.cart.length} SKU Registered</span>
                                            <span className="text-3xl font-black text-slate-900 tracking-tighter italic">${t.cart.reduce((s, i) => s + (i.finalPrice * i.quantity), 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Price Modal */}
            {pendingProduct && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F172A]/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

                        <div className="text-center mb-12">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <Plus size={48} />
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">{pendingProduct.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em]">Precio no definido en catálogo</p>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic">Cantidad</label>
                                    <input type="number" step="0.01" required
                                        className="w-full p-6 bg-slate-50 border-none rounded-[1.75rem] text-3xl font-black text-slate-900 focus:ring-8 focus:ring-slate-900/5 text-center shadow-inner"
                                        value={manualQty} onChange={e => setManualQty(e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic">Precio Unit.</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-3xl italic">$</span>
                                        <input type="number" step="0.01" required autoFocus
                                            className="w-full pl-12 p-6 bg-slate-900 text-white border-none rounded-[1.75rem] text-3xl font-black focus:ring-8 focus:ring-emerald-500/20 text-center shadow-2xl"
                                            value={manualPrice} onChange={e => setManualPrice(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button type="submit" className="w-full h-20 bg-emerald-600 text-white rounded-[2rem] font-black text-xl italic uppercase tracking-tighter shadow-2xl hover:scale-[1.05] transition-all">
                                    Registrar Partida
                                </button>
                                <button type="button" onClick={() => setPendingProduct(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] py-2 hover:text-rose-600 transition-all">
                                    Cancelar Operación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Shift Modal */}
            {showShiftModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-lg shadow-2xl relative overflow-hidden text-center">
                        <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Activity size={48} className="text-emerald-400" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase mb-4">Apertura de Caja</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Inicie sesión operativa para habilitar transacciones</p>

                        <form onSubmit={handleOpenShift} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Fondo de Caja Inicial ($)</label>
                                <input type="number" step="0.01" required autoFocus
                                    className="w-full p-8 bg-slate-50 border-none rounded-[2.5rem] text-5xl font-black text-slate-900 focus:ring-8 focus:ring-slate-900/5 text-center shadow-inner"
                                    value={initialCash} onChange={e => setInitialCash(e.target.value)} />
                            </div>

                            <button type="submit" className="w-full h-24 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl italic uppercase tracking-tighter shadow-2xl hover:scale-[1.05] transition-all">
                                Iniciar Jornada
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;
