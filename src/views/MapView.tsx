import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { MAPS } from '../../constants';

export const MapView: React.FC = () => {
    const { playerState, actions } = usePlayer();
    if (!playerState) return null;

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-3xl font-heading mb-6">Select a Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MAPS.map(map => {
                    const isCurrent = playerState.currentMapId === map.id;
                    return (
                        <div key={map.id} className={`p-6 rounded-xl shadow-lg border-2 ${isCurrent ? 'border-jp-gold shadow-jp-gold/20' : 'border-jp-wood-light'} bg-jp-wood/80 backdrop-blur-sm flex flex-col transition-all duration-300 hover:border-jp-gold hover:-translate-y-1`}>
                            <h3 className="text-2xl font-heading">{map.name}</h3>
                            <p className="text-jp-cream/70 flex-grow my-4">{map.description}</p>
                            <button onClick={() => actions.changeMap(map.id)} disabled={isCurrent} className={`w-full mt-auto text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md disabled:shadow-none ${isCurrent ? 'bg-jp-wood-light cursor-not-allowed' : 'bg-jp-red hover:bg-opacity-80'}`}>
                                {isCurrent ? 'Currently Here' : 'Travel'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};