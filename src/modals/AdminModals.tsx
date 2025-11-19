
import React, { useState, useEffect } from 'react';
import type { PlayerState, PatchNote, PatchNoteEntry } from '../../types';
import { ModalWrapper } from '../components/ModalWrapper';
import { formatNumber } from '../lib/utils';

export const AdminEditPlayerModal: React.FC<{ player: PlayerState; onClose: () => void; onUpdate: (updates: Partial<PlayerState>) => void; }> = ({ player, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        coins: player.coins, level: player.level, xp: player.xp, bait: player.bait, stonehengeCrystals: player.stonehengeCrystals,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };
    
    return (
        <ModalWrapper title={`Edit ${player.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Coins</label>
                        <input type="number" name="coins" value={formData.coins} onChange={handleChange} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Level</label>
                        <input type="number" name="level" value={formData.level} onChange={handleChange} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">XP</label>
                        <input type="number" name="xp" value={formData.xp} onChange={handleChange} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Bait</label>
                        <input type="number" name="bait" value={formData.bait} onChange={handleChange} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                     <div className="col-span-2">
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Stonehenge Crystals</label>
                        <input type="number" name="stonehengeCrystals" value={formData.stonehengeCrystals} onChange={handleChange} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-jp-red hover:bg-opacity-80 rounded-md font-semibold text-white">Save Changes</button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export const AdminGiftPlayerModal: React.FC<{ player: PlayerState; onClose: () => void; onSend: (gifts: { coins: number; bait: number; stonehengeCrystals: number; }) => void; }> = ({ player, onClose, onSend }) => {
    const [gifts, setGifts] = useState<{ coins: number | ''; bait: number | ''; stonehengeCrystals: number | '' }>({ coins: '', bait: '', stonehengeCrystals: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGifts(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend({ coins: Number(gifts.coins) || 0, bait: Number(gifts.bait) || 0, stonehengeCrystals: Number(gifts.stonehengeCrystals) || 0 });
    };

    return (
        <ModalWrapper title={`Send Gift to ${player.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-jp-cream/70">Enter the amount of items to add to the player's inventory. The current balance is shown for reference.</p>
                <div>
                    <label className="block text-sm font-medium text-jp-cream/70 mb-1">Coins (Current: {formatNumber(player.coins)})</label>
                    <input type="number" name="coins" value={gifts.coins} onChange={handleChange} placeholder="0" className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-jp-cream/70 mb-1">Bait (Current: {formatNumber(player.bait)})</label>
                    <input type="number" name="bait" value={gifts.bait} onChange={handleChange} placeholder="0" className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-jp-cream/70 mb-1">Stonehenge Crystals (Current: {formatNumber(player.stonehengeCrystals)})</label>
                    <input type="number" name="stonehengeCrystals" value={gifts.stonehengeCrystals} onChange={handleChange} placeholder="0" className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-white">Send Gift</button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export const AdminDeletePlayerModal: React.FC<{ player: PlayerState; onClose: () => void; onDelete: () => void; }> = ({ player, onClose, onDelete }) => (
    <ModalWrapper title={`Delete ${player.name}`} onClose={onClose}>
        <div className="space-y-4">
            <p className="text-lg text-red-400">Are you sure you want to permanently delete this player?</p>
            <p className="text-jp-cream/90">This action cannot be undone. All data associated with <span className="font-bold text-white">{player.name}</span> will be lost.</p>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold">Cancel</button>
                <button type="button" onClick={onDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold text-white">Delete Player</button>
            </div>
        </div>
    </ModalWrapper>
);

export const AdminDeletePatchNoteModal: React.FC<{ patchNote: PatchNote; onClose: () => void; onDelete: () => void; }> = ({ patchNote, onClose, onDelete }) => (
    <ModalWrapper title="Delete Patch Note" onClose={onClose}>
        <div className="space-y-4">
            <p className="text-lg text-jp-cream/90">Are you sure you want to delete version <span className="font-bold text-jp-gold">{patchNote.version}</span>?</p>
            <p className="text-sm text-jp-cream/60">This will remove the patch note from the Info tab for all players. This action cannot be undone.</p>
            <div className="flex justify-end gap-4 pt-4 border-t border-jp-wood-light/50 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold transition-colors">Cancel</button>
                <button type="button" onClick={onDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold text-white transition-colors shadow-md">Confirm Delete</button>
            </div>
        </div>
    </ModalWrapper>
);

export const AdminPatchNoteModal: React.FC<{ 
    patchNote?: PatchNote; 
    onClose: () => void; 
    onSave: (data: { version: string; release_date: string; content: PatchNoteEntry[] }) => void; 
}> = ({ patchNote, onClose, onSave }) => {
    const [version, setVersion] = useState(patchNote?.version || '');
    const [releaseDate, setReleaseDate] = useState(patchNote?.release_date || '');
    const [content, setContent] = useState<PatchNoteEntry[]>(patchNote?.content || [{ type: 'add', text: '' }]);

    const handleAddEntry = () => {
        setContent([...content, { type: 'add', text: '' }]);
    };

    const handleRemoveEntry = (index: number) => {
        const newContent = [...content];
        newContent.splice(index, 1);
        setContent(newContent);
    };

    const handleEntryChange = (index: number, field: keyof PatchNoteEntry, value: string) => {
        const newContent = [...content];
        newContent[index] = { ...newContent[index], [field]: value };
        setContent(newContent);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ version, release_date: releaseDate, content });
    };

    return (
        <ModalWrapper title={patchNote ? "Edit Patch Note" : "Add Patch Note"} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Version Name</label>
                        <input type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g., v1.8.0" required className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-jp-cream/70 mb-1">Release Date</label>
                        <input type="text" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} placeholder="e.g., August 15, 2024" required className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/>
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-jp-cream/70">Changes</label>
                        <button type="button" onClick={handleAddEntry} className="text-xs bg-jp-gold text-jp-wood-dark px-2 py-1 rounded font-bold hover:bg-jp-gold/80">+ Add Entry</button>
                    </div>
                    <div className="space-y-2">
                        {content.map((entry, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <select 
                                    value={entry.type} 
                                    onChange={(e) => handleEntryChange(idx, 'type', e.target.value)}
                                    className="p-2 bg-jp-wood-dark border border-jp-wood-light/50 rounded-md text-sm w-24"
                                >
                                    <option value="add">Add</option>
                                    <option value="update">Update</option>
                                    <option value="remove">Remove</option>
                                </select>
                                <input 
                                    type="text" 
                                    value={entry.text} 
                                    onChange={(e) => handleEntryChange(idx, 'text', e.target.value)}
                                    placeholder="Description of change..."
                                    required
                                    className="flex-grow p-2 bg-jp-wood-light border border-jp-wood-light/50 rounded-md text-sm"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveEntry(idx)}
                                    className="p-2 text-red-400 hover:text-red-300 font-bold"
                                    title="Remove line"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-jp-wood-light">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-jp-red hover:bg-opacity-80 rounded-md font-semibold text-white">Save Note</button>
                </div>
            </form>
        </ModalWrapper>
    );
};
