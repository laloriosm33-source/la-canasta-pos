import { useState, useEffect } from 'react';
import { ShoppingBasket, Loader2, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const [isInit, setIsInit] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        // Check if system is initialized
        fetch('http://localhost:3000/api/auth/init-status')
            .then(res => res.json())
            .then(data => setIsInit(data.initialized))
            .catch(err => console.error('Error al verificar estado inicial', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = (!isInit || isRegistering) ? '/register' : '/login';
            const body = (!isInit || isRegistering)
                ? { email, password, name, role: 'ADMIN' }
                : { email, password };

            const res = await fetch(`http://localhost:3000/api/auth${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error en la solicitud');

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('¡Acceso concedido!', {
                    icon: '🔒',
                    style: {
                        borderRadius: '20px',
                        background: '#1e293b',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                setTimeout(() => navigate('/'), 1200);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F172A] selection:bg-indigo-500/30">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <Toaster position="top-center" />

            <div className="w-full max-w-[480px] p-4 relative z-10 animate-fade-in">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-white/5">
                            <ShoppingBasket size={48} className="text-white" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-full shadow-lg animate-bounce">
                            <Sparkles size={16} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                            {!isInit ? 'Configuración Inicial' : (isRegistering ? 'Crear Acceso' : 'Gateway de Acceso')}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] opacity-60">
                            {!isInit ? 'Estableciendo el nodo administrador' : 'Software de Punto de Venta Enterprise'}
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(!isInit || isRegistering) && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-slate-900 transition-all text-white font-bold placeholder-slate-600"
                                        placeholder="Tu nombre master"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identificador de Usuario</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-900 transition-all text-white font-bold placeholder-slate-600"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clave de Seguridad</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-slate-900 transition-all text-white font-bold placeholder-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="group w-full relative h-16 mt-4 overflow-hidden rounded-2xl bg-indigo-600 font-black text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-indigo-600 transition-all duration-500 group-hover:skew-x-12 group-hover:scale-150"></div>
                            <div className="relative flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span className="text-lg tracking-tight">
                                            {!isInit ? 'Inicializar Maestro' : (isRegistering ? 'Confirmar Registro' : 'Validar Entrada')}
                                        </span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {isInit && (
                        <div className="mt-8 text-center pt-6 border-t border-white/5">
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors"
                            >
                                {isRegistering ? '¿Ya tienes acceso? Retornar' : '¿Nuevo Operador? Solicitar Acceso'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Security Badge */}
                <div className="mt-10 flex items-center justify-center gap-3 opacity-20">
                    <ShieldCheck size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Military Grade Encryption Active</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
