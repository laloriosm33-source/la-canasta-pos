import { useState, useEffect, useCallback } from 'react';
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
    startTime: string;
    endTime: string | null;
    initialCash: string;
    userId: string;
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

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.businessName) {
                setBusinessInfo({
                    name: res.data.businessName,
                    address: res.data.address || ''
                });
            }
        } catch { console.error("Error fetching settings for POS"); }
    };

    const handleOpenShift = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await api.post('/finance/shifts/open', {
                userId: user.id,
                initialCash: parseFloat(initialCash)
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

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const myOpenShift = shiftRes.data.find((s: Shift) => s.userId === user.id && !s.endTime);
            if (myOpenShift) {
                setActiveShift(myOpenShift);
            } else {
                setShowShiftModal(true);
            }
        } catch {
            toast.error("Error al sincronizar datos del catálogo.");
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
        fetchSettings();
        const saved = localStorage.getItem('pos_tickets');
        if (saved) {
            try {
                setSavedTickets(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing saved tickets", e);
            }
        }
    }, [fetchInitialData]);

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
            toast.success("¡Venta completada!", { icon: '✅', style: { borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 'bold' } });

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
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-6">
                    <div className="flex gap-3">
                        <div className="w-24 shrink-0">
                            <input
                                type="number" step="0.01" min="0.01"
                                className="w-full px-4 py-3 bg-slate-900 text-white border-none rounded-xl focus:ring-4 focus:ring-emerald-500/20 font-black text-center text-xl shadow-lg"
                                value={currentQty}
                                onChange={e => setCurrentQty(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Escanear SKU o filtrar por nombre..."
                                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500/20 transition-all text-base font-bold placeholder-slate-300 shadow-inner"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['ALL', ...categories.map(c => c.id)].map(catId => {
                            const cat = categories.find(c => c.id === catId);
                            const label = catId === 'ALL' ? 'Todos' : cat?.name;
                            const active = selectedCategory === catId;
                            return (
                                <button
                                    key={catId}
                                    onClick={() => setSelectedCategory(catId)}
                                    className={`px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap
                                    ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pr-2 custom-scrollbar content-start">
                    {filteredProducts.map(product => {
                        const stock = getStockInCurrentBranch(product);
                        const isOutOfStock = stock <= 0;
                        return (
                            <div
                                key={product.id}
                                onClick={() => !isOutOfStock && handleAddToCart(product)}
                                className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95
                                ${isOutOfStock ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                            >
                                <div className="h-full flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900 leading-tight line-clamp-2 text-xs uppercase tracking-tight">{product.name}</h3>
                                        <span className="block text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">{product.code || 'S/K'}</span>
                                    </div>

                                    <div className="mt-4 flex justify-between items-end">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${stock <= 5 ? 'bg-rose-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {stock} {product.unit}
                                        </div>
                                        <span className="text-lg font-black text-slate-900 tracking-tight italic">
                                            <span className="text-[10px] mr-0.5 text-slate-400 font-bold">$</span>{product.priceRetail || '0.00'}
                                        </span>
                                    </div>
                                </div>
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                        <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Agotado</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- BILLING COLUMN --- */}
            <div className="w-96 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden relative">

                {/* Header Section */}
                <div className="p-6 pb-4 space-y-6">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex-1">
                            <User size={16} className="text-indigo-500" />
                            <select
                                className="bg-transparent text-[10px] font-bold text-slate-800 outline-none cursor-pointer uppercase tracking-wider w-full"
                                value={selectedCustomer?.id || ''}
                                onChange={e => setSelectedCustomer(customers.find(x => x.id === e.target.value) || null)}
                            >
                                <option value="">Mostrador (Normal)</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={() => setShowTicketModal(true)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all relative">
                                <FolderOpen size={18} />
                                {savedTickets.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[8px] font-bold rounded flex items-center justify-center border-2 border-white">{savedTickets.length}</span>}
                            </button>
                            <button onClick={() => cart.length > 0 && (window.confirm("¿Vaciar carrito?") && setCart([]))} className="w-10 h-10 bg-white border border-slate-100 text-rose-300 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Total a Cobrar</p>
                        <h1 className="text-5xl font-black tracking-tight flex items-start italic leading-none">
                            <span className="text-lg mt-1 text-emerald-400 opacity-80 mr-1">$</span>
                            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h1>
                    </div>
                </div>

                {/* Cart List */}
                <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group py-1 border-b border-slate-50 last:border-0">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-slate-800 truncate text-[11px] uppercase tracking-tight">{item.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {item.quantity} {item.unit} <span className="mx-0.5 text-slate-200">x</span> ${Number(item.finalPrice).toFixed(2)}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-slate-900 text-sm tracking-tight italic">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))} className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white"><Minus size={10} /></button>
                                    <button onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))} className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white"><X size={10} /></button>
                                    <button onClick={() => setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it))} className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white"><Plus size={10} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-10 opacity-10">
                            <ShoppingCart size={80} strokeWidth={1} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'CASH', label: 'Efectivo', icon: Banknote, active: paymentMethod === 'CASH' },
                            { id: 'TRANSFER', label: 'Transf.', icon: Smartphone, active: paymentMethod === 'TRANSFER' },
                            { id: 'CREDIT', label: 'Fiado', icon: CreditCard, active: paymentMethod === 'CREDIT' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => (m.id === 'CREDIT' && !selectedCustomer) ? toast.error('Selecciona el Cliente para el Crédito') : setPaymentMethod(m.id as 'CASH' | 'TRANSFER' | 'CREDIT')}
                                className={`relative py-3 rounded-xl border transition-all flex flex-col items-center gap-1.5
                                ${m.active ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-200 text-slate-400 bg-white'}`}
                            >
                                <m.icon size={18} className={m.active ? 'text-indigo-600' : 'text-slate-300'} />
                                <span className="text-[8px] font-bold uppercase tracking-wider">{m.label}</span>
                                {m.active && <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full h-20 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-8 disabled:opacity-50 disabled:grayscale group"
                    >
                        <div className="text-left">
                            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-0.5">Finalizar Venta</p>
                            <span className="font-black text-xl tracking-tight uppercase italic">Confirmar Pago</span>
                        </div>
                        {loading ? (
                            <Activity className="animate-spin text-emerald-400" size={24} />
                        ) : (
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                <ShoppingCart size={20} className="text-emerald-400 group-hover:text-white" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

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
