import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [sound, setSound] = useState(null);

    // Memoize playBackgroundSound to prevent function recreation on every render
    const playBackgroundSound = useCallback(async () => {
        if (sound) {
            console.log('Background sound is already playing.');
            return; // Prevent multiple instances
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
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                console.log('Background Sound Stopped');
            } catch (error) {
                console.error('Error stopping background sound:', error);
            }
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