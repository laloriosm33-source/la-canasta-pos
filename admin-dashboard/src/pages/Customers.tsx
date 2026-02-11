import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Phone, Building2, Mail, CreditCard, CheckCircle2, Search, X, DollarSign } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    currentBalance: string;
    branch?: { name: string };
    branchId: string;
}

interface Branch {
    id: string;
    name: string;
}

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', branchId: '',
        rfc: '', taxRegime: '', zipCode: ''
    });

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentData, setPaymentData] = useState({ amount: '', method: 'CASH' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [custRes, branchRes] = await Promise.all([
                api.get('/customers'),
                api.get('/branches')
            ]);
            setCustomers(custRes.data);
            setBranches(branchRes.data);
            if (branchRes.data.length > 0 && !formData.branchId) {
                setFormData(prev => ({ ...prev, branchId: branchRes.data[0].id }));
            }
        } catch {
            toast.error('Error al sincronizar base de clientes');
        } finally {
            setLoading(false);
        }
    }, [formData.branchId]);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            toast.success('¡Cliente registrado con éxito!');
            setIsModalOpen(false);
            fetchData();
            setFormData({
                name: '', phone: '', email: '', address: '', branchId: branches[0]?.id || '',
                rfc: '', taxRegime: '', zipCode: ''
            });
        } catch {
            toast.error('Ocurrió un error al procesar el registro');
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        try {
            await api.post('/customers/payment', {
                customerId: selectedCustomer.id,
                amount: parseFloat(paymentData.amount),
                paymentMethod: paymentData.method
            });
            toast.success(`Abono procesado correctamente`, { icon: '💰' });
            setPaymentModalOpen(false);
            setPaymentData({ amount: '', method: 'CASH' });
            fetchData();
        } catch {
            toast.error("Error al registrar el flujo de caja.");
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 italic">Relationship Hub</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Control de cartera y lealtad de la red.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.03] transition-all text-sm uppercase tracking-widest"
                >
                    <UserPlus size={24} /> Registrar Miembro
                </button>
            </header>

            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl py-6 flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={22} />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre comercial o identificador telefónico..."
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900/20 font-black text-slate-800 shadow-sm text-lg transition-all italic placeholder:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCustomers.map((customer) => {
                    const balance = parseFloat(customer.currentBalance);
                    const isInDebt = balance > 0;

                    return (
                        <div key={customer.id} className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-50 hover:shadow-indigo-500/10 transition-all duration-700 group relative overflow-hidden font-sans">
                            {/* Decorative Indicator */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 ${isInDebt ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-8 mb-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-slate-900/30 italic">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-2xl leading-tight truncate tracking-tighter uppercase italic">{customer.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                            <Building2 size={12} className="text-emerald-500" /> {customer.branch?.name || ' Corporativo'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12">
                                    {customer.phone && (
                                        <div className="flex items-center gap-4 text-slate-900 font-black text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-900 shadow-sm"><Phone size={16} /></div>
                                            {customer.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 text-slate-500 font-bold text-xs px-2 italic">
                                        <Mail size={16} className="shrink-0 text-slate-300" />
                                        <span className="line-clamp-1 truncate">{customer.email || 'Sin registro electrónico'}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[3rem] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 z-10">Estado Global</p>
                                    <div className={`text-4xl font-black tracking-tighter z-10 ${isInDebt ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>

                                    {isInDebt ? (
                                        <button
                                            onClick={() => { setSelectedCustomer(customer); setPaymentModalOpen(true); }}
                                            className="mt-8 w-full h-16 bg-white text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.03] transition-all shadow-2xl flex items-center justify-center gap-3 group/btn"
                                        >
                                            <CreditCard size={18} className="text-rose-500" /> Amortizar Saldo
                                        </button>
                                    ) : (
                                        <div className="mt-6 flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle2 size={16} /> Línea de Crédito Libre
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredCustomers.length === 0 && !loading && (
                    <div className="col-span-full py-48 text-center bg-white rounded-[4rem] border border-slate-100 shadow-inner">
                        <UserPlus size={96} className="mx-auto text-slate-50 mb-8" />
                        <h4 className="text-4xl font-black text-slate-200 tracking-tighter uppercase italic">Sin coincidencias</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-4">La base de datos de lealtad no arrojó resultados.</p>
                    </div>
                )}
            </div>

            {/* Modal: Registro Cliente */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-2xl relative border border-white/10 custom-scrollbar mt-12 mb-12 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl"><X size={32} /></button>

                        <div className="flex items-center gap-10 mb-16">
                            <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                <UserPlus size={48} />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Client Profile</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Sincronización de Base de Lealtad</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Razón Social / Identidad</label>
                                <input required className="w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/20 font-black text-slate-900 transition-all text-2xl shadow-inner placeholder:text-slate-200"
                                    placeholder="Nombre del titular..."
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Sede Responsable</label>
                                    <div className="relative">
                                        <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-black text-slate-800 appearance-none cursor-pointer text-lg shadow-inner italic"
                                            value={formData.branchId} onChange={e => setFormData({ ...formData, branchId: e.target.value })}>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Línea de Contacto</label>
                                    <div className="relative">
                                        <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-xl shadow-inner"
                                            placeholder="55 XX XX XX XX"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">RFC / Tax ID</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-xl shadow-inner uppercase"
                                        placeholder="XAXX010101000"
                                        value={formData.rfc} onChange={e => setFormData({ ...formData, rfc: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">C.P. / Zip Code</label>
                                    <input className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-black text-slate-900 text-xl shadow-inner"
                                        placeholder="00000"
                                        value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Régimen Fiscal</label>
                                <select className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none font-black text-slate-800 appearance-none cursor-pointer text-lg shadow-inner italic"
                                    value={formData.taxRegime} onChange={e => setFormData({ ...formData, taxRegime: e.target.value })}>
                                    <option value="">Seleccionar Régimen...</option>
                                    <option value="601">General de Ley Personas Morales</option>
                                    <option value="603">Personas Morales con Fines no Lucrativos</option>
                                    <option value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                                    <option value="606">Arrendamiento</option>
                                    <option value="612">Personas Físicas con Actividades Empresariales y Profesionales</option>
                                    <option value="626">Régimen Simplificado de Confianza - RESICO</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Punto de Entrega / Domicilio</label>
                                <input className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-900/5 outline-none font-bold text-slate-800 text-xl shadow-inner"
                                    placeholder="Calle, Ciudad y Referencias Maestras..."
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            <div className="flex gap-4 pt-12 border-t border-slate-50">
                                <button type="submit" className="flex-1 h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic">
                                    Confirmar Alta
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                    Abortar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Abono a Cuenta */}
            {paymentModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-md shadow-2xl relative border border-white/20">
                        <button onClick={() => setPaymentModalOpen(false)} className="absolute top-10 right-10 p-4 text-slate-300 hover:text-slate-900 transition-all"><X size={32} /></button>

                        <div className="text-center mb-12">
                            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                                <DollarSign size={48} />
                            </div>
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Amortizar</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest leading-none">Flujo para: <span className="text-indigo-600">{selectedCustomer.name}</span></p>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-12">
                            <div className="text-center">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 block italic">Importe de la Operación</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-5xl italic">$</span>
                                    <input type="number" step="0.01" required
                                        className="w-full pl-16 pr-8 py-10 bg-slate-900 text-white border-none rounded-[3rem] text-6xl font-black focus:ring-8 focus:ring-emerald-500/20 text-center shadow-2xl tracking-tighter"
                                        placeholder="0.00"
                                        value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button type="submit" className="w-full h-20 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-tighter italic">
                                    Liquidar Ahora
                                </button>
                                <button type="button" onClick={() => setPaymentModalOpen(false)} className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] py-2 hover:text-rose-500 transition-colors">
                                    Gatillo de Cierre
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
