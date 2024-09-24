// /src/games/photoEscape/PhotoEscapeNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';
import PhotoEscapeResultScreen from './PhotoEscapeResultScreen';
import PhotoEscapeLimerickScreen from './PhotoEscapeLimerickScreen';
import PhotoEscapeCameraScreen from './PhotoEscapeCameraScreen';
import CongratulationsScreen from './CongratulationsScreen';
import LostScreen from './LostScreen';
import { useRoute } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const PhotoEscapeNavigator = () => {
    const route = useRoute();
    const { pin, name, selfieURL } = route.params || {}; // Get pin, name, and selfieURL

    return (
        <Stack.Navigator initialRouteName="PhotoEscapeReady">
            <Stack.Screen
                name="PhotoEscapeReady"
                component={PhotoEscapeReadyScreen}
                initialParams={{ pin, name, selfieURL }} // Pass pin, name, and selfieURL
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PhotoEscapeLimerick"
                component={PhotoEscapeLimerickScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PhotoEscapeCamera"
                component={PhotoEscapeCameraScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PhotoEscapeResult"
                component={PhotoEscapeResultScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CongratulationsScreen"
                component={CongratulationsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LostScreen"
                component={LostScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default PhotoEscapeNavigator;
