import React, { useRef, useEffect } from 'react';

export const ProfilePopup: React.FC<{ onLogout: () => void; onStatsClick: () => void; onMailClick: () => void; onChangeAvatarClick: () => void; onCollectionClick: () => void; onSettingsClick: () => void; onClose: () => void; }> = ({ onLogout, onStatsClick, onMailClick, onChangeAvatarClick, onCollectionClick, onSettingsClick, onClose }) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={popupRef} className="absolute top-20 right-4 bg-jp-wood rounded-lg shadow-xl w-56 border-2 border-jp-wood-light z-50">
            <div className="p-2 flex flex-col gap-1 text-jp-cream">
                <button onClick={onMailClick} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors">Mail</button>
                <button onClick={onChangeAvatarClick} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors">Change Avatar</button>
                <button onClick={onStatsClick} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors">Player Stats</button>
                <button onClick={onCollectionClick} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors">Collection</button>
                <button onClick={onSettingsClick} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors">Settings</button>
                <button onClick={onLogout} className="w-full text-left p-2 rounded hover:bg-jp-wood-light transition-colors text-jp-red">Logout</button>
            </div>
        </div>
    )
};
