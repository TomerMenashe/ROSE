import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [sound, setSound] = useState(null);
    const isSoundStoppedRef = useRef(false); // Using useRef instead of useState

    // Memoize playBackgroundSound to prevent function recreation on every render
    const playBackgroundSound = useCallback(async () => {
        if (sound || isSoundStoppedRef.current) {
            console.log('Background sound is already playing or has been stopped.');
            return; // Prevent multiple instances or restarting after stop
        }
        try {
            console.log('Loading Background Sound');
            const { sound: newSound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/Start-To-Room-Screen.mp3'),
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: 0.5, // Adjust volume as needed
                }
            );
            setSound(newSound);
            console.log('Background Sound Playing');
        } catch (error) {
            console.error('Error playing background sound:', error);
        }
    }, [sound]);

    // Memoize stopBackgroundSound to prevent function recreation on every render
    const stopBackgroundSound = useCallback(async () => {
        if (sound) {
            try {
                console.log('Stopping Background Sound');
                await sound.pauseAsync(); // Using pauseAsync instead of stopAsync
                await sound.unloadAsync();
                setSound(null);
                isSoundStoppedRef.current = true; // Mark as stopped to prevent future playback
                console.log('Background Sound Stopped');
            } catch (error) {
                console.error('Error stopping background sound:', error);
            }
        } else {
            console.log('No background sound to stop.');
        }
    }, [sound]);

    useEffect(() => {
        // Configure audio settings
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
        });

        // Cleanup on unmount
        return () => {
            stopBackgroundSound();
        };
    }, [stopBackgroundSound]);

    return (
        <AudioContext.Provider value={{ playBackgroundSound, stopBackgroundSound }}>
            {children}
        </AudioContext.Provider>
    );
};