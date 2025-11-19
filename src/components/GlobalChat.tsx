
import React, { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '../lib/supabase';
import { usePlayer } from '../context/PlayerContext';
import type { ChatMessage } from '../../types';

// @ts-ignore
const { RealtimeChannel } = supabase;

export const GlobalChat: React.FC = () => {
    const { playerState, actions } = usePlayer();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isCooldown, setIsCooldown] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Subscribe to realtime messages
    useEffect(() => {
        // Initial fetch of last 50 messages
        const fetchMessages = async () => {
            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching chat:', error);
            } else if (data) {
                setMessages(data.reverse() as ChatMessage[]);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabaseClient.channel('global-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
                const newMsg = payload.new as ChatMessage;
                setMessages(prev => [...prev, newMsg]);
                
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
            })
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Reset unread count when opened
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            // Focus input if needed, or specific logic
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerState) return;
        if (!newMessage.trim()) return;
        if (isCooldown) {
            actions.showNotification("Please wait a moment before sending another message.");
            return;
        }

        const content = newMessage.trim().slice(0, 200); // Limit char count
        
        // Optimistic UI update (optional, but let's rely on realtime for truth)
        setNewMessage('');
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 2000); // 2 second cooldown

        const { error } = await supabaseClient.from('chat_messages').insert({
            user_id: playerState.userId,
            sender_name: playerState.name,
            sender_avatar: playerState.avatar,
            content: content
        });

        if (error) {
            console.error('Error sending message:', error);
            actions.showNotification("Failed to send message.");
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!playerState) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div className={`
                mb-4 w-80 sm:w-96 bg-jp-wood-dark/90 backdrop-blur-md border-2 border-jp-wood-light rounded-xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
            `}
            style={{ maxHeight: '60vh', display: isOpen ? 'flex' : 'none', flexDirection: 'column' }}
            >
                {/* Header */}
                <div className="bg-jp-wood p-3 border-b border-jp-wood-light flex justify-between items-center">
                    <h3 className="text-jp-gold font-heading text-lg">Global Chat</h3>
                    <button onClick={() => setIsOpen(false)} className="text-jp-cream/70 hover:text-white hover:bg-jp-red/50 rounded-full w-6 h-6 flex items-center justify-center transition-colors">&times;</button>
                </div>

                {/* Messages Body */}
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-black/20 h-64 sm:h-80">
                    {messages.map((msg) => {
                        const isMe = msg.user_id === playerState.userId;
                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-8 h-8 bg-jp-wood-light rounded-full flex items-center justify-center border border-jp-gold/50 text-lg shadow-sm select-none">
                                    {msg.sender_avatar}
                                </div>
                                
                                {/* Message Bubble */}
                                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && <span className="text-[10px] text-jp-cream/60 ml-1 mb-0.5">{msg.sender_name}</span>}
                                    <div className={`
                                        px-3 py-2 rounded-lg text-sm break-words shadow-md relative
                                        ${isMe 
                                            ? 'bg-jp-gold text-jp-wood-dark rounded-tr-none' 
                                            : 'bg-jp-wood-light text-jp-cream rounded-tl-none'
                                        }
                                    `}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-jp-cream/40 mt-1 mx-1">{formatTime(msg.created_at)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSendMessage} className="p-3 bg-jp-wood border-t border-jp-wood-light flex gap-2">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Say hello..."
                        maxLength={200}
                        className="flex-grow bg-jp-wood-dark/50 text-jp-cream text-sm rounded-lg border border-jp-wood-light focus:border-jp-gold focus:outline-none px-3 py-2 placeholder-jp-cream/30"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || isCooldown}
                        className="bg-jp-gold hover:bg-jp-gold/80 text-jp-wood-dark font-bold p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-90">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Floating Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110
                    border-2 border-jp-gold
                    ${isOpen ? 'bg-jp-red text-white rotate-90' : 'bg-jp-wood-light text-jp-gold'}
                `}
            >
                {isOpen ? '✕' : '🗨️'}
                
                {/* Notification Badge */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-jp-wood animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};
