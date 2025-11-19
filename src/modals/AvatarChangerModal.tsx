import React from 'react';
import { AVATARS } from '../../constants';
import { usePlayer } from '../context/PlayerContext';
import { ModalWrapper } from '../components/ModalWrapper';

export const AvatarChangerModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { playerState, actions } = usePlayer();
    if (!playerState) return null;
    
    return (
        <ModalWrapper title="Change Avatar" onClose={onClose}>
            <div className="grid grid-cols-4 gap-4">
                {AVATARS.map(avatar => (
                    <button 
                        key={avatar} 
                        onClick={() => { actions.changeAvatar(avatar); onClose(); }}
                        className={`text-4xl p-4 rounded-lg transition-colors ${playerState.avatar === avatar ? 'bg-jp-gold/30 ring-2 ring-jp-gold' : 'bg-jp-wood-light hover:bg-opacity-70'}`}
                    >
                        {avatar}
                    </button>
                ))}
            </div>
        </ModalWrapper>
    );
};