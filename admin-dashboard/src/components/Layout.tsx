import React from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-fixed custom-scrollbar">
                <div className="max-w-[1400px] mx-auto p-12 md:p-16 min-h-screen">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                        {children}
                    </div>
                </div>

                {/* Global Aura / Background accents */}
                <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.03] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="fixed bottom-0 left-80 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                <div className="fixed top-1/2 left-1/2 w-[800px] h-[800px] bg-slate-500/[0.01] blur-[200px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            </main>
        </div>
    );
};

export default Layout;
