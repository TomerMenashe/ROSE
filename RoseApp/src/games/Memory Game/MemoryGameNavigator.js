// /src/games/MemoryGame/MemoryGameNavigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MemoryGame from '../Memory Game/MemoryGame';
import MemoryGameLoading from '../Memory Game/MemoryGameLoading'; // Import the LoadingScreen

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
