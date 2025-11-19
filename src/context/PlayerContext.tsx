
import React, { createContext, useContext } from 'react';
import { useGameState } from '../hooks/useGameState';
import type { PlayerState, Fish, Mail, PatchNote } from '../../types';
import { PotionType } from '../../types';

// @ts-ignore
const { Session } = supabase;

type GameStateActions = {
    addCaughtFish: (fish: Omit<Fish, 'id' | 'value'>) => Promise<void>;
    consumeBait: () => Promise<void>;
    buyBait: (amount: number, price: number) => Promise<void>;
    sellFish: (fishId: string) => Promise<void>;
    sellAllFish: () => Promise<void>;
    buyRod: (rodId: number) => Promise<void>;
    equipRod: (rodId: number) => Promise<void>;
    buyPotion: (potionId: PotionType) => Promise<void>;
    changeMap: (mapId: string) => Promise<void>;
    changeAvatar: (avatar: string) => Promise<void>;
    toggleAutoFishing: () => Promise<void>;
    enchantRod: (rodId: number) => Promise<void>;
    claimMail: (mailItem: Mail) => Promise<void>;
    deleteMail: (mailId: string) => Promise<void>;
    deleteAllClaimedMail: () => Promise<void>;
    showNotification: (message: string) => void;
    toggleFavoriteFish: (fishId: string) => Promise<void>;
    completeTutorial: () => Promise<void>;
    resetTutorial: () => Promise<void>;
}

type PlayerContextType = {
    playerState: PlayerState | null;
    loading: boolean;
    notification: string | null;
    lastCaughtFish: Fish | null;
    mail: Mail[];
    patchNotes: PatchNote[];
    patchNotesError: boolean;
    actions: GameStateActions;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode; session: InstanceType<typeof Session> }> = ({ children, session }) => {
    const { playerState, loading, notification, lastCaughtFish, mail, patchNotes, patchNotesError, actions } = useGameState(session.user.id);

    return (
        <PlayerContext.Provider value={{ playerState, loading, notification, lastCaughtFish, mail, patchNotes, patchNotesError, actions }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
