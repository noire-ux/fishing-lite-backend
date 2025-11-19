import React, { useMemo } from 'react';

export const DynamicSky: React.FC<{ hour: number; minute: number }> = ({ hour, minute }) => {
    const totalMinutes = hour * 60 + minute;

    const skyState = useMemo(() => {
        if (totalMinutes >= 120 && totalMinutes < 360) return { bg: 'bg-sky-dawn', sun: 'rising', moon: 'setting', stars: 15, clouds: 0, fog: true };
        if (totalMinutes >= 360 && totalMinutes < 570) {
            const progress = (totalMinutes - 360) / (570 - 360);
            return { bg: 'bg-sky-morning', sun: 'visible', moon: 'hidden', stars: 0, clouds: 2, fog: progress < 0.9 };
        }
        if (totalMinutes >= 570 && totalMinutes < 870) return { bg: 'bg-sky-day', sun: 'visible', moon: 'hidden', stars: 0, clouds: 4, fog: false };
        if (totalMinutes >= 870 && totalMinutes < 1110) return { bg: 'bg-sky-afternoon', sun: 'visible', moon: 'hidden', stars: 0, clouds: 3, fog: false };
        if (totalMinutes >= 1110 && totalMinutes < 1120) return { bg: 'bg-sky-dusk', sun: 'setting', moon: 'rising', stars: 5, clouds: 2, fog: false };
        if (totalMinutes >= 1120 && totalMinutes < 1320) return { bg: 'bg-sky-night', sun: 'hidden', moon: 'visible', stars: 20, clouds: 1, fog: false };
        return { bg: 'bg-sky-late-night', sun: 'hidden', moon: 'visible', stars: 40, clouds: 2, fog: false };
    }, [totalMinutes]);

    const starElements = useMemo(() => {
        if (skyState.stars === 0) return null;
        return Array.from({ length: skyState.stars }, (_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 70}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`
            };
            const size = Math.random() > 0.5 ? 'w-1 h-1' : 'w-0.5 h-0.5';
            return <div key={i} className={`absolute ${size} bg-white rounded-full animate-twinkle`} style={style} />;
        });
    }, [skyState.stars]);

    const cloudElements = useMemo(() => {
        if (skyState.clouds === 0) return null;
        return Array.from({ length: skyState.clouds }, (_, i) => {
            const style = {
                top: `${10 + Math.random() * 40}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${80 + Math.random() * 80}s`,
                opacity: `${0.4 + Math.random() * 0.4}`
            };
            return <div key={i} className="absolute w-48 h-16 sm:w-64 sm:h-20 bg-white/70 rounded-full blur-xl animate-cloud-drift" style={style} />;
        });
    }, [skyState.clouds]);

    const sunAnimationClass = { rising: 'animate-[sunrise_60s_ease-out_forwards]', setting: 'animate-[sunset_60s_ease-in_forwards]', visible: 'opacity-100', hidden: 'opacity-0 -bottom-1/4' }[skyState.sun] || 'opacity-0';
    const moonAnimationClass = { rising: 'animate-[moonrise_60s_ease-out_forwards]', setting: 'animate-[moonset_60s_ease-in_forwards]', visible: 'opacity-80', hidden: 'opacity-0 -bottom-1/4' }[skyState.moon] || 'opacity-0';

    return (
        <div className={`fixed inset-0 z-[-1] transition-all duration-[5000ms] ease-linear overflow-hidden ${skyState.bg}`}>
            <div className="absolute inset-0 transition-opacity duration-[5000ms]" style={{ opacity: skyState.stars > 0 ? 1 : 0 }}>{starElements}</div>
            <div className={`absolute left-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-radial from-yellow-100 to-amber-300 shadow-[0_0_50px_20px_rgba(255,255,224,0.5)] transition-all duration-[3000ms] ${sunAnimationClass}`} style={{ top: '15%' }} />
            <div className={`absolute left-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-radial from-slate-50 to-slate-300 shadow-[0_0_40px_15px_rgba(226,232,240,0.4)] transition-all duration-[3000ms] ${moonAnimationClass}`} style={{ top: '10%' }} />
            <div className="absolute inset-0 transition-opacity duration-[5000ms]" style={{ opacity: skyState.clouds > 0 ? 1 : 0 }}>{cloudElements}</div>
            {skyState.fog && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-200/40 to-transparent transition-opacity duration-[5000ms] animate-pulse" />}
        </div>
    );
};
