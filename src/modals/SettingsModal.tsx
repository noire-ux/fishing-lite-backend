
import React from 'react';
import { ModalWrapper } from '../components/ModalWrapper';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { MutedIcon, UnmutedIcon } from '../components/icons';

export const SettingsModal: React.FC<{
    onClose: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isFpsBoostEnabled: boolean;
    onToggleFpsBoost: () => void;
    onResetTutorial: () => void;
    isPushEnabled: boolean;
    onEnablePush: () => void;
}> = ({ onClose, isMuted, onToggleMute, volume, onVolumeChange, isFpsBoostEnabled, onToggleFpsBoost, onResetTutorial, isPushEnabled, onEnablePush }) => {
    return (
        <ModalWrapper title="Settings" onClose={onClose}>
            <div className="space-y-6 pb-24">
                <ToggleSwitch label="Peningkatan FPS" checked={isFpsBoostEnabled} onChange={onToggleFpsBoost} />
                <p className="text-sm text-jp-cream/70 -mt-3">Disables animations and complex graphics to improve performance on some devices.</p>
                
                <div className="pt-4 border-t border-jp-wood-light">
                    <p className="text-lg mb-2">Offline Notifications</p>
                    {isPushEnabled ? (
                        <p className="text-green-400 font-bold">✓ Active</p>
                    ) : (
                        <button 
                            onClick={onEnablePush}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
                        >
                            Enable Desktop Notifications
                        </button>
                    )}
                    <p className="text-xs text-jp-cream/60 mt-1">Receive updates about mail and gifts when you are not playing.</p>
                </div>

                <div className="pt-4 border-t border-jp-wood-light">
                    <p className="text-lg mb-2">Tutorial</p>
                    <button 
                        onClick={() => { onResetTutorial(); onClose(); }}
                        className="w-full py-2 border-2 border-jp-gold text-jp-gold hover:bg-jp-gold hover:text-jp-wood-dark font-bold rounded-lg transition-colors"
                    >
                        Replay Tutorial
                    </button>
                </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleMute} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-jp-wood-light/50 hover:bg-jp-wood-light text-jp-cream transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                        {isMuted ? <MutedIcon /> : <UnmutedIcon />}
                    </button>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="w-full h-2 bg-jp-wood-light rounded-lg appearance-none cursor-pointer" aria-label="Volume control" />
                </div>
            </div>
        </ModalWrapper>
    );
};
