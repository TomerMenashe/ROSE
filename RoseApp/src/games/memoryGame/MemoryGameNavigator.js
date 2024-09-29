// /src/games/MemoryGame/MemoryGameNavigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MemoryGame from '../memoryGame/MemoryGame';
import MemoryGameLoading from '../memoryGame/MemoryGameLoading'; // Import the LoadingScreen

const Stack = createNativeStackNavigator();

const MemoryGameNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="MemoryGameLoading" screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="MemoryGameLoading"
                component={MemoryGameLoading}
            />
            <Stack.Screen
                name="MemoryGame"
                component={MemoryGame}
            />
        </Stack.Navigator>
    );
};

export default MemoryGameNavigator;
