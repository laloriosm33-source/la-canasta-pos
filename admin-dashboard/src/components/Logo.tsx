import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
    // Map abstract size to pixel height for the image
    const sizes = {
        sm: { height: 'h-8', text: 'text-lg' },
        md: { height: 'h-12', text: 'text-2xl' },
        lg: { height: 'h-20', text: 'text-4xl' }
    };

    const { height, text } = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src="/logo.png"
                alt="La Canasta Logo"
                className={`${height} object-contain drop-shadow-sm rounded-full bg-[#f4f1ea]`}
            />
            {size !== 'sm' && (
                <div>
                    <h1 className={`font-bold text-[#8B4513] ${text} leading-tight font-serif tracking-tight`}>
                        LA CANASTA
                    </h1>
                    <p className="text-[0.6rem] text-[#6B8E23] font-bold tracking-[0.2em] uppercase">Huevos & Abarrotes</p>
                </div>
            )}
        </div>
    );
};
