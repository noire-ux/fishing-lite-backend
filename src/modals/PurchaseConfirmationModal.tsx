import React from 'react';
import { ModalWrapper } from '../components/ModalWrapper';
import { formatNumber } from '../lib/utils';

export const PurchaseConfirmationModal: React.FC<{
    item: { name: string; price: string | number; };
    onConfirm: () => void;
    onClose: () => void;
}> = ({ item, onConfirm, onClose }) => {
    const priceString = typeof item.price === 'number' ? `${formatNumber(item.price)} 両` : item.price;
    return (
        <ModalWrapper title="Confirm Purchase" onClose={onClose}>
            <div className="text-center space-y-6">
                <p className="text-lg text-jp-cream/90">
                    Are you sure you want to purchase <span className="font-bold text-white">{item.name}</span> for <span className="font-bold text-jp-gold">{priceString}</span>?
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold transition-colors">Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="px-6 py-2 bg-jp-red hover:bg-opacity-80 text-white font-bold rounded-md transition-all shadow-md">Confirm</button>
                </div>
            </div>
        </ModalWrapper>
    );
};
