import React from 'react';

export const Notification: React.FC<{ message: string | null }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 bg-jp-red text-jp-cream py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse-fast font-semibold">
            {message}
        </div>
    );
};
