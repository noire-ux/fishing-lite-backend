import React from 'react';

export const ModalWrapper: React.FC<{ children: React.ReactNode; onClose: () => void; title: string, className?: string }> = ({ children, onClose, title, className = 'max-w-md' }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
        <div className={`bg-jp-wood rounded-xl shadow-2xl w-full m-4 border-2 border-jp-wood-light ${className}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b-2 border-jp-wood-light bg-jp-wood-dark/50 rounded-t-xl">
                <h2 className="text-xl font-heading text-jp-gold">{title}</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-jp-cream/70 hover:text-white bg-jp-wood-light hover:bg-jp-red rounded-full transition-colors">&times;</button>
            </div>
            <div className="p-6 text-jp-cream relative">
                {children}
            </div>
        </div>
    </div>
);
