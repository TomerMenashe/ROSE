// /src/games/photoEscape/PhotoEscapeNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';
import PhotoEscapeResultScreen from './PhotoEscapeResultScreen';
import PhotoEscapeLimerickScreen from './PhotoEscapeLimerickScreen';
import PhotoEscapeCameraScreen from './PhotoEscapeCameraScreen';
import CongratulationsScreen from './CongratulationsScreen';
import LoserScreen from './LoserScreen'; // Import LoserScreen
import LostScreen from './LostScreen';
import { useRoute } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const PhotoEscapeNavigator = () => {
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {}; // Get pin, name, and selfieURL

    return (
        <Stack.Navigator initialRouteName="PhotoEscapeReady" screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="PhotoEscapeReady"
                component={PhotoEscapeReadyScreen}
                initialParams={{ pin, name, selfieURL }} // Pass pin, name, and selfieURL
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
                name="PhotoEscapeResult"
                component={PhotoEscapeResultScreen}
            />
            <Stack.Screen
                name="CongratulationsScreen"
                component={CongratulationsScreen}
            />
            <Stack.Screen
                name="LoserScreen" // Add LoserScreen to navigator
                component={LoserScreen}
            />
            <Stack.Screen
                name="LostScreen"
                component={LostScreen}
            />
        </Stack.Navigator>
    );
};

export default PhotoEscapeNavigator;
