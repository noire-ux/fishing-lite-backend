
import React, { useState, useEffect } from 'react';
import type { PlayerState, PatchNote, PatchNoteEntry } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { supabaseClient } from '../lib/supabase';
import { formatNumber } from '../lib/utils';
import { AdminEditPlayerModal, AdminGiftPlayerModal, AdminDeletePlayerModal, AdminPatchNoteModal, AdminDeletePatchNoteModal } from '../modals/AdminModals';

export const AdminView: React.FC = () => {
    const { actions, patchNotes: contextPatchNotes } = usePlayer();
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [editingPlayer, setEditingPlayer] = useState<PlayerState | null>(null);
    const [giftingPlayer, setGiftingPlayer] = useState<PlayerState | null>(null);
    const [deletingPlayer, setDeletingPlayer] = useState<PlayerState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'players' | 'server'>('players');

    // Server Management States
    const [globalSubject, setGlobalSubject] = useState('');
    const [globalBody, setGlobalBody] = useState('');
    const [globalRewards, setGlobalRewards] = useState({ coins: '', bait: '', stonehengeCrystals: '' });
    const [isSending, setIsSending] = useState(false);

    // Patch Notes States
    const [editingPatchNote, setEditingPatchNote] = useState<PatchNote | null>(null);
    const [deletingPatchNote, setDeletingPatchNote] = useState<PatchNote | null>(null);
    const [isCreatingPatchNote, setIsCreatingPatchNote] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            setIsLoading(true);
            const { data, error } = await supabaseClient.from('players').select('*').order('name', { ascending: true });
            if (error) {
                console.error("Error fetching players:", error);
                actions.showNotification("Could not load player data.");
            } else {
                setPlayers(data as PlayerState[]);
            }
            setIsLoading(false);
        };
        fetchPlayers();
    }, [actions.showNotification]);

    const handleUpdatePlayer = async (updates: Partial<PlayerState>) => {
        if (!editingPlayer) return;
        const { error } = await supabaseClient.from('players').update(updates).eq('userId', editingPlayer.userId);
        if (error) {
            actions.showNotification(`Failed to update ${editingPlayer.name}.`);
            console.error(error);
        } else {
            actions.showNotification(`${editingPlayer.name} updated successfully.`);
            setPlayers(prev => prev.map(p => p.userId === editingPlayer.userId ? { ...p, ...updates } : p));
            setEditingPlayer(null);
        }
    };

    const handleSendGift = async (gifts: { coins: number; bait: number; stonehengeCrystals: number; }) => {
        if (!giftingPlayer) return;
        const nonEmptyGifts = Object.fromEntries(Object.entries(gifts).filter(([_, value]) => value > 0));
        if (Object.keys(nonEmptyGifts).length === 0) { actions.showNotification("No items selected to gift."); return; }

        const { error } = await supabaseClient.from('mail').insert({
            recipient_user_id: giftingPlayer.userId, subject: 'A Gift from the Admins!',
            body: `Here are some items to help you on your fishing adventure. Enjoy!`, rewards: nonEmptyGifts
        });
        if (error) {
            actions.showNotification(`Failed to send gift to ${giftingPlayer.name}.`);
            console.error(error);
        } else {
            actions.showNotification(`Gift sent to ${giftingPlayer.name}'s mailbox.`);
            
            // Trigger Offline Notification via Edge Function
            await supabaseClient.functions.invoke('send-push', {
                body: {
                    type: 'individual',
                    userId: giftingPlayer.userId,
                    title: "🎁 You Received a Gift!",
                    body: "Check your in-game mailbox to claim your rewards from the Admins!"
                }
            });

            setGiftingPlayer(null);
        }
    };
    
    const handleDeletePlayer = async () => {
        if (!deletingPlayer) return;
        const { data, error } = await supabaseClient.rpc('delete_user_by_admin', { user_id_to_delete: deletingPlayer.userId });
        if (error) {
            actions.showNotification(`Failed to delete ${deletingPlayer.name}. Error: ${error.message}`);
            console.error(error);
        } else if (typeof data === 'string' && data.startsWith('Error:')) {
            actions.showNotification(data);
            console.error(data);
        } else {
            actions.showNotification(`${deletingPlayer.name} has been deleted successfully.`);
            setPlayers(prev => prev.filter(p => p.userId !== deletingPlayer.userId));
            setDeletingPlayer(null);
        }
    };

    const handleSendGlobalMail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!globalSubject.trim() || !globalBody.trim()) { actions.showNotification("Subject and body are required for global mail."); return; }
        setIsSending(true);

        const { data: allPlayers, error: playersError } = await supabaseClient.from('players').select('userId');
        if (playersError || !allPlayers) {
            actions.showNotification("Error fetching player list.");
            console.error(playersError);
            setIsSending(false);
            return;
        }

        const rewardsToSend = { coins: Number(globalRewards.coins) || 0, bait: Number(globalRewards.bait) || 0, stonehengeCrystals: Number(globalRewards.stonehengeCrystals) || 0 };
        const mailBatch = allPlayers.map(p => ({
            recipient_user_id: p.userId, sender_name: 'Game Admin', subject: globalSubject, body: globalBody, rewards: rewardsToSend,
        }));
        const { error: mailError } = await supabaseClient.from('mail').insert(mailBatch);
        if (mailError) {
            actions.showNotification(`Failed to send global mail. Error: ${mailError.message}`);
            console.error(mailError);
        } else {
            actions.showNotification(`Global mail sent to ${allPlayers.length} players successfully!`);

            // Trigger Offline Notification Broadcast via Edge Function
            await supabaseClient.functions.invoke('send-push', {
                body: {
                    type: 'broadcast',
                    title: `📬 ${globalSubject}`,
                    body: "New Global Mail! Log in now to check your mailbox."
                }
            });

            setGlobalSubject(''); setGlobalBody(''); setGlobalRewards({ coins: '', bait: '', stonehengeCrystals: '' });
        }
        setIsSending(false);
    };

    const handleRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGlobalRewards(prev => ({...prev, [name]: value}));
    };

    // Patch Note Handlers
    const handleSavePatchNote = async (noteData: { version: string; release_date: string; content: PatchNoteEntry[] }) => {
        if (editingPatchNote) {
            // Update existing
            const { error } = await supabaseClient.from('patch_notes').update(noteData).eq('id', editingPatchNote.id);
            if (error) {
                actions.showNotification(`Error updating patch note: ${error.message}`);
            } else {
                actions.showNotification("Patch note updated successfully.");
                setEditingPatchNote(null);
            }
        } else {
            // Create new
            const { error } = await supabaseClient.from('patch_notes').insert(noteData);
            if (error) {
                actions.showNotification(`Error creating patch note: ${error.message}`);
            } else {
                actions.showNotification("Patch note created successfully.");
                setIsCreatingPatchNote(false);
            }
        }
    };

    const handleConfirmDeletePatchNote = async () => {
        if (!deletingPatchNote) return;
        
        const { error } = await supabaseClient.from('patch_notes').delete().eq('id', deletingPatchNote.id);
        if (error) {
            actions.showNotification(`Error deleting patch note: ${error.message}`);
        } else {
            actions.showNotification("Patch note deleted successfully.");
            setDeletingPatchNote(null);
        }
    };

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 sm:p-8">
            {editingPlayer && <AdminEditPlayerModal player={editingPlayer} onClose={() => setEditingPlayer(null)} onUpdate={handleUpdatePlayer} />}
            {giftingPlayer && <AdminGiftPlayerModal player={giftingPlayer} onClose={() => setGiftingPlayer(null)} onSend={handleSendGift} />}
            {deletingPlayer && <AdminDeletePlayerModal player={deletingPlayer} onClose={() => setDeletingPlayer(null)} onDelete={handleDeletePlayer} />}
            
            {/* Patch Note Modals */}
            {(isCreatingPatchNote || editingPatchNote) && (
                <AdminPatchNoteModal 
                    patchNote={editingPatchNote || undefined}
                    onClose={() => { setIsCreatingPatchNote(false); setEditingPatchNote(null); }}
                    onSave={handleSavePatchNote}
                />
            )}
            
            {deletingPatchNote && (
                <AdminDeletePatchNoteModal 
                    patchNote={deletingPatchNote}
                    onClose={() => setDeletingPatchNote(null)}
                    onDelete={handleConfirmDeletePatchNote}
                />
            )}

            <h2 className="text-3xl font-heading mb-4">Admin Panel</h2>
            <p className="text-jp-cream/70 mb-6">Manage players and server-wide settings.</p>
            <div className="flex border-b border-jp-wood-light mb-6">
                <button onClick={() => setActiveTab('players')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'players' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Player Management</button>
                <button onClick={() => setActiveTab('server')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'server' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Server Management</button>
            </div>
            
            {activeTab === 'players' && (
                <>
                    <div className="mb-6"><input type="text" placeholder="Search for a player by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-lg p-3 bg-jp-wood-light rounded-md border border-jp-wood-light/50 focus:outline-none focus:ring-2 focus:ring-jp-gold"/></div>
                    {isLoading ? <div className="p-8 text-center"><div className="w-8 h-8 mx-auto border-4 border-dashed rounded-full animate-spin border-jp-gold"></div></div>
                    : ( <div className="bg-jp-wood/80 rounded-lg border border-jp-wood-light overflow-hidden"><div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left">
                            <thead className="bg-jp-wood-dark/50"><tr>
                                <th className="p-4 font-heading text-jp-gold">Player</th><th className="p-4 font-heading text-jp-gold">Level</th>
                                <th className="p-4 font-heading text-jp-gold">Coins</th><th className="p-4 font-heading text-jp-gold">Role</th>
                                <th className="p-4 text-center font-heading text-jp-gold">Actions</th>
                            </tr></thead>
                            <tbody>{filteredPlayers.map(player => (
                                <tr key={player.userId} className="border-t border-jp-wood-light hover:bg-jp-wood-light/30 transition-colors">
                                    <td className="p-4 font-semibold flex items-center gap-3"><span className="text-2xl w-8 h-8 bg-jp-wood-light rounded-full flex items-center justify-center">{player.avatar}</span>{player.name}</td>
                                    <td className="p-4">{player.level}</td><td className="p-4 text-jp-gold">{formatNumber(player.coins)}</td>
                                    <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${player.role === 'admin' ? 'bg-red-500 text-white' : 'bg-jp-wood-light text-jp-cream/80'}`}>{player.role}</span></td>
                                    <td className="p-4"><div className="flex justify-center gap-2">
                                        <button onClick={() => setEditingPlayer(player)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition-colors">Edit</button>
                                        <button onClick={() => setGiftingPlayer(player)} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm font-semibold transition-colors">Gift</button>
                                        <button onClick={() => setDeletingPlayer(player)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors">Delete</button>
                                    </div></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div></div>)}
                </>
            )}
            
            {activeTab === 'server' && (
                <div className="space-y-8">
                    {/* Global Mail Section */}
                    <div className="bg-jp-wood/80 rounded-lg border border-jp-wood-light p-6 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-heading mb-4 text-jp-gold">Send Global Mail</h3>
                        <p className="text-jp-cream/70 mb-6">Send an in-game mail to all registered players. This is useful for announcements or distributing rewards.</p>
                        <form onSubmit={handleSendGlobalMail} className="space-y-4">
                             <div><label htmlFor="globalSubject" className="block text-sm font-medium text-jp-cream/80 mb-1">Subject</label><input id="globalSubject" type="text" value={globalSubject} onChange={e => setGlobalSubject(e.target.value)} required className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"/></div>
                             <div><label htmlFor="globalBody" className="block text-sm font-medium text-jp-cream/80 mb-1">Body</label><textarea id="globalBody" value={globalBody} onChange={e => setGlobalBody(e.target.value)} required rows={4} className="w-full p-2 bg-jp-wood-light rounded-md border border-jp-wood-light/50"></textarea></div>
                             <div><label className="block text-sm font-medium text-jp-cream/80 mb-2">Rewards (Optional)</label><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input type="number" name="coins" value={globalRewards.coins} onChange={handleRewardChange} placeholder="Coins" className="p-2 bg-jp-wood-dark/50 rounded-md border border-jp-wood-light/50" />
                                <input type="number" name="bait" value={globalRewards.bait} onChange={handleRewardChange} placeholder="Bait" className="p-2 bg-jp-wood-dark/50 rounded-md border border-jp-wood-light/50" />
                                <input type="number" name="stonehengeCrystals" value={globalRewards.stonehengeCrystals} onChange={handleRewardChange} placeholder="Crystals" className="p-2 bg-jp-wood-dark/50 rounded-md border border-jp-wood-light/50" />
                             </div></div>
                             <div className="text-right pt-4"><button type="submit" disabled={isSending} className="px-6 py-2 bg-jp-red hover:bg-opacity-80 rounded-md font-semibold text-white disabled:bg-jp-wood-light disabled:cursor-wait">{isSending ? 'Sending...' : 'Send to All Players'}</button></div>
                        </form>
                    </div>

                    {/* Patch Notes Management Section */}
                    <div className="bg-jp-wood/80 rounded-lg border border-jp-wood-light p-6 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-heading text-jp-gold">Patch Notes</h3>
                                <p className="text-jp-cream/70">Manage game updates shown in the Info tab.</p>
                            </div>
                            <button onClick={() => setIsCreatingPatchNote(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                                + Add Patch Note
                            </button>
                        </div>
                        
                        {contextPatchNotes.length === 0 ? (
                            <p className="text-center text-jp-cream/50 italic py-4">No patch notes found.</p>
                        ) : (
                            <div className="space-y-4">
                                {contextPatchNotes.map(note => (
                                    <div key={note.id} className="flex justify-between items-center p-4 bg-jp-wood-dark/30 rounded-lg border border-jp-wood-light/30 hover:border-jp-gold/50 transition-colors">
                                        <div>
                                            <span className="font-bold text-jp-gold">{note.version}</span>
                                            <span className="text-jp-cream/60 text-sm ml-3">{note.release_date}</span>
                                            <p className="text-xs text-jp-cream/50 mt-1">{note.content.length} changes listed</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPatchNote(note)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white">Edit</button>
                                            <button onClick={() => setDeletingPatchNote(note)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm text-white">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
