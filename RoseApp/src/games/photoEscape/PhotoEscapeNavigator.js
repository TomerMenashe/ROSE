// /src/games/photoEscape/PhotoEscapeNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';
import PhotoEscapeLimerickScreen from './PhotoEscapeLimerickScreen';
import PhotoEscapeCameraScreen from './PhotoEscapeCameraScreen';
import CongratulationsScreen from './CongratulationsScreen';
import LoserScreen from './LoserScreen';
import PhotoEscapeLoadingScreen from "./PhotoEscapeLoadingScreen";


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
                name="PhotoEscapeLoadingScreen"
                component={PhotoEscapeLoadingScreen}
            />

        </Stack.Navigator>
    );
};

export default PhotoEscapeNavigator;
