
import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabase';
import { VAPID_PUBLIC_KEY } from '../constants';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = (userId: string | null) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && userId) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                    setLoading(false);
                });
            });
        } else {
            setLoading(false);
        }
    }, [userId]);

    const subscribeUser = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported');
            
            // Register Service Worker if not already
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send subscription to Supabase
            const { error: dbError } = await supabaseClient.from('push_subscriptions').upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
                auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))),
            }, { onConflict: 'endpoint' });

            if (dbError) throw dbError;

            setIsSubscribed(true);
            alert("Offline Notifications Enabled! You will now receive updates even when the game is closed.");
        } catch (err: any) {
            console.error("Failed to subscribe:", err);
            setError(err.message || "Failed to subscribe");
            alert("Failed to enable notifications. Please check if you blocked them in browser settings.");
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, subscribeUser, loading, error };
};
