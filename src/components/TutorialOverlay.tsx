
import React, { useState, useEffect } from 'react';
import type { GameView } from '../../types';

interface TutorialStep {
    title: string;
    message: string;
    targetView: GameView;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "Welcome, Angler!",
        message: "Selamat datang di Fishing Lite! Saya akan memandu Anda menjadi pemancing legendaris. Mari kita mulai dengan dasar-dasarnya.",
        targetView: 'FISHING'
    },
    {
        title: "The Basics",
        message: "Di bagian atas layar, Anda bisa melihat Koin (Mata Uang) dan Level Anda. Anda memerlukan koin untuk membeli umpan dan joran yang lebih kuat.",
        targetView: 'FISHING'
    },
    {
        title: "How to Fish",
        message: "Tekan tombol 'Cast Line' untuk melempar kail. Tunggu hingga ikan memakan umpan, lalu tekan 'Pull Fish'. Hati-hati, jika barnya merah, ikan sedang memberontak!",
        targetView: 'FISHING'
    },
    {
        title: "Your Backpack",
        message: "Semua ikan yang Anda tangkap ada di sini. Anda bisa menjual ikan untuk mendapatkan Koin. Pastikan tas tidak penuh, atau Anda tidak bisa memancing lagi!",
        targetView: 'BACKPACK'
    },
    {
        title: "The Shop",
        message: "Gunakan Koin Anda di sini! Beli Joran (Rod) yang lebih kuat untuk menangkap ikan besar, Potion untuk keberuntungan, dan jangan lupa beli Umpan (Bait)!",
        targetView: 'SHOP'
    },
    {
        title: "World Map",
        message: "Dunia ini luas. Anda bisa berpindah ke lokasi lain dengan ikan-ikan unik di sini. Beberapa lokasi memerlukan level tertentu.",
        targetView: 'MAPS'
    },
    {
        title: "Good Luck!",
        message: "Anda siap berpetualang! Tangkap ikan langka, temukan mutasi, dan jadilah yang terbaik. Selamat memancing!",
        targetView: 'FISHING'
    }
];

export const TutorialOverlay: React.FC<{ 
    onComplete: () => void; 
    onRequestViewChange: (view: GameView) => void; 
}> = ({ onComplete, onRequestViewChange }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const currentStep = TUTORIAL_STEPS[currentStepIndex];

    useEffect(() => {
        onRequestViewChange(currentStep.targetView);
    }, [currentStepIndex, onRequestViewChange, currentStep.targetView]);

    const handleNext = () => {
        if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        if (window.confirm("Lewati tutorial? Anda bisa mengaksesnya kembali nanti di menu Settings.")) {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end sm:justify-center items-center pb-24 sm:pb-0">
            {/* Dimmed Background to focus attention */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity duration-500"></div>

            {/* Tutorial Box */}
            <div className="relative pointer-events-auto w-full max-w-xl mx-4 bg-jp-wood border-4 border-jp-wood-light rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-float overflow-hidden">
                
                {/* Decorative Header Pattern */}
                <div className="h-2 bg-jp-gold w-full"></div>

                <div className="p-6 pt-8 relative">
                    {/* Character Portrait Badge */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-jp-wood-dark rounded-full border-4 border-jp-gold flex items-center justify-center text-5xl shadow-xl z-10">
                        👴
                    </div>

                    <div className="text-center mt-4 space-y-4">
                        <h3 className="text-2xl font-heading text-jp-gold uppercase tracking-wider border-b border-jp-wood-light/30 pb-2 inline-block">
                            {currentStep.title}
                        </h3>
                        
                        <div className="bg-black/20 p-4 rounded-lg border border-jp-wood-light/20 min-h-[100px] flex items-center justify-center">
                            <p className="text-jp-cream text-lg leading-relaxed font-medium">
                                "{currentStep.message}"
                            </p>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-3 pt-2">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'bg-jp-gold scale-125' : 'bg-jp-wood-dark border border-jp-wood-light'}`}
                                />
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center mt-6 gap-4">
                            <button 
                                onClick={handleSkip}
                                className="px-4 py-2 rounded-lg border-2 border-jp-wood-light text-jp-cream/60 hover:text-white hover:bg-jp-red/20 hover:border-jp-red transition-colors text-sm font-bold uppercase tracking-wide"
                            >
                                Skip Tutorial
                            </button>

                            <button 
                                onClick={handleNext}
                                className="flex-grow sm:flex-grow-0 bg-jp-gold hover:bg-amber-400 text-jp-wood-dark font-bold py-3 px-8 rounded-lg shadow-[0_4px_0_rgb(180,83,9)] hover:shadow-[0_2px_0_rgb(180,83,9)] hover:translate-y-[2px] transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {currentStepIndex === TUTORIAL_STEPS.length - 1 ? "Finish Journey" : "Next Step"} 
                                {currentStepIndex < TUTORIAL_STEPS.length - 1 && <span>→</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
