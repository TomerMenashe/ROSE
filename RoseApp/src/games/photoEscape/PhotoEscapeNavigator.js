// /src/games/photoEscape/PhotoEscapeNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';
import PhotoEscapeLimerickScreen from './PhotoEscapeLimerickScreen';
import PhotoEscapeCameraScreen from './PhotoEscapeCameraScreen';
import CongratulationsScreen from './CongratulationsScreen';
import LoserScreen from './LoserScreen';
import MemoryGame from '../Memory Game/MemoryGame';
import LoadingScreen from '../Memory Game/LoadingScreen'; // Import the LoadingScreen

const Stack = createNativeStackNavigator();

const PhotoEscapeNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="PhotoEscapeReady" screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="PhotoEscapeReady"
                component={PhotoEscapeReadyScreen}
            />
            <Stack.Screen
                name="PhotoEscapeLimerick"
                component={PhotoEscapeLimerickScreen}
            />
            <Stack.Screen
                name="PhotoEscapeCamera"
                component={PhotoEscapeCameraScreen}
            />
            <Stack.Screen
                name="CongratulationsScreen"
                component={CongratulationsScreen}
            />
            <Stack.Screen
                name="LoserScreen"
                component={LoserScreen}
            />
            <Stack.Screen
                name="LoadingScreen" // Add LoadingScreen to the navigator
                component={LoadingScreen}
            />
            <Stack.Screen
                name="FaceSwap"
                component={MemoryGame}
            />
        </Stack.Navigator>
    );
};

export default PhotoEscapeNavigator;
