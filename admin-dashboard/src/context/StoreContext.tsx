import React, { createContext, useContext, useState, useEffect } from 'react';

interface Branch {
    id: string;
    name: string;
    address?: string;
    phone?: string;
}

interface StoreContextType {
    selectedBranchId: string;
    setSelectedBranchId: (id: string) => void;
    currentBranch: Branch | null;
    setCurrentBranch: (branch: Branch | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedBranchId, setSelectedBranchId] = useState<string>(localStorage.getItem('selectedBranchId') || 'all');
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);

    useEffect(() => {
        if (selectedBranchId !== 'all') {
            localStorage.setItem('selectedBranchId', selectedBranchId);
        } else {
            localStorage.removeItem('selectedBranchId');
        }
    }, [selectedBranchId]);

    return (
        <StoreContext.Provider value={{ selectedBranchId, setSelectedBranchId, currentBranch, setCurrentBranch }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
};
