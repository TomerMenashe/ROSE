// CustomButton.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const playSound = async () => {
    try {
        // Load and play the local sound file
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/Sounds/button.mp3') // Adjust the path to your local sound file
        );
        await sound.playAsync();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
};

const CustomButton = ({ onPress, style, children }) => {
    const handlePress = async () => {
        await playSound();
        if (onPress) onPress();
    };

    return (
        <TouchableOpacity onPress={handlePress} style={style}>
            {children}
        </TouchableOpacity>
    );
};

export default CustomButton;
