import { useState, useEffect, useCallback } from 'react';
import { Save, Building2, MapPin, Phone, Hash, ShieldCheck, Printer, Globe, Palette } from 'lucide-react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState({
        businessName: 'LA CANASTA',
        rfc: 'XAXX010101000',
        address: 'Av. Principal 123, Centro',
        phone: '555-0000',
        currency: 'MXN',
        timezone: 'CST',
        receiptHeader: '¡Gracias por su compra!',
        receiptFooter: 'Este no es un comprobante fiscal.'
    });
    const [loading, setLoading] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get('/settings');
            if (Object.keys(res.data).length > 0) {
                setSettings(prev => ({ ...prev, ...res.data }));
            }
        } catch {
            console.error("Error al cargar configuración remota");
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchSettings(), 0);
        return () => clearTimeout(timer);
    }, [fetchSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/settings', settings);
            toast.success("Parámetros maestros sincronizados en la nube", {
                icon: '☁️',
                style: {
                    borderRadius: '20px',
                    background: '#0F172A',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif'
                }
            });
        } catch {
            toast.error("Error al persistir configuración");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
            <Toaster position="top-right" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic uppercase">Motor de Configuración</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Parámetros Globales de la Empresa</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-10 h-16 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                >
                    <Save size={20} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Identidad de Negocio */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase italic">Identidad Corporativa</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">Datos maestros y fiscales</p>
                            </div>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Razón Social</label>
                                <input name="businessName" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-slate-900/5 focus:bg-white outline-none font-black text-slate-800 transition-all text-lg shadow-inner"
                                    value={settings.businessName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">RFC / ID Fiscal</label>
                                <div className="relative">
                                    <Hash size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="rfc" className="w-full pl-14 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-slate-900/5 focus:bg-white outline-none font-black text-slate-800 transition-all text-lg shadow-inner uppercase"
                                        value={settings.rfc} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Dirección Matriz</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="address" className="w-full pl-14 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-slate-900/5 focus:bg-white outline-none font-bold text-slate-800 transition-all text-lg shadow-inner"
                                        value={settings.address} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Teléfono Corporativo</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="phone" className="w-full pl-14 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-slate-900/5 focus:bg-white outline-none font-black text-slate-800 transition-all text-lg shadow-inner"
                                        value={settings.phone} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600">
                                <Printer size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase italic">Terminales y Tickets</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">Personalización de salida de impresión</p>
                            </div>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Encabezado de Comprobante</label>
                                <textarea name="receiptHeader" rows={2} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white font-bold text-slate-700 shadow-inner resize-none"
                                    value={settings.receiptHeader} onChange={handleChange}></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Pie de Página / Legales</label>
                                <textarea name="receiptFooter" rows={2} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:bg-white font-bold text-slate-700 shadow-inner resize-none"
                                    value={settings.receiptFooter} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Regional y Seguridad */}
                <div className="space-y-10">
                    <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <ShieldCheck size={28} className="text-emerald-400" />
                            <h4 className="text-xl font-black italic">Seguridad de Infraestructura</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shadow-xl"><ShieldCheck size={18} /></div>
                                    <span className="font-bold text-sm">Auth JWT Active</span>
                                </div>
                                <div className="w-10 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center opacity-40 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400"><Globe size={18} /></div>
                                    <span className="font-bold text-sm">Cloud Sync Hub</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded">PRO</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 p-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Globe size={24} /></div>
                            <h4 className="text-xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Regionalización</h4>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Divisa del Sistema</label>
                                <select name="currency" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none appearance-none cursor-pointer italic"
                                    value={settings.currency} onChange={handleChange}>
                                    <option value="MXN">Peso Mexicano (MXN)</option>
                                    <option value="USD">Dólar Americano (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Zona Horaria</label>
                                <select name="timezone" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none appearance-none cursor-pointer italic"
                                    value={settings.timezone} onChange={handleChange}>
                                    <option value="CST">Central Standard Time (CST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4 mb-4 text-emerald-500">
                                <Palette size={20} />
                                <span className="font-black text-xs uppercase tracking-widest italic">Tema Dinámico</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-white shadow-lg ring-2 ring-slate-900 cursor-pointer"></div>
                                <div className="w-10 h-10 rounded-full bg-indigo-500 border-4 border-white shadow-lg opacity-40 hover:opacity-100 transition-opacity cursor-pointer"></div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500 border-4 border-white shadow-lg opacity-40 hover:opacity-100 transition-opacity cursor-pointer"></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
