import { useState, useEffect } from 'react';

// GAME_HOURS_IN_DAY should come from constants but to avoid circular dependency with App.tsx which is not ideal, we define it here.
// In a larger app, this constant would be in a separate config file.
const GAME_HOURS_IN_DAY = 24;
const REAL_MILLISECONDS_IN_GAME_DAY = 6 * 60 * 60 * 1000; // 6 hours real-time = 1 game day


const calculateGameTime = (now: number) => {
    const realMillisecondsPassedToday = now % REAL_MILLISECONDS_IN_GAME_DAY;
    const fractionOfDay = realMillisecondsPassedToday / REAL_MILLISECONDS_IN_GAME_DAY;
    const totalGameMinutes = fractionOfDay * GAME_HOURS_IN_DAY * 60;
    const hour = Math.floor(totalGameMinutes / 60);
    const minute = Math.floor(totalGameMinutes % 60);
    return { hour, minute };
};

export const useGameTime = () => {
    const [gameTime, setGameTime] = useState(() => calculateGameTime(Date.now()));

    useEffect(() => {
        const updateGameTime = () => {
            setGameTime(calculateGameTime(Date.now()));
        };
        const intervalId = setInterval(updateGameTime, 5000); // Update every 5 seconds
        return () => clearInterval(intervalId);
    }, []);

    return gameTime;
};