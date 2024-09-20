import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';  // Ready screen
import PhotoEscapeGameScreen from './PhotoEscapeGameScreen';    // Game screen
import PhotoEscapeResultScreen from './PhotoEscapeResultScreen';  // Result screen
import { useRoute } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const PhotoEscapeNavigator = () => {
  const route = useRoute();
  const { pin } = route.params || {};  // Safely access pin

  console.log("PIN received in PhotoEscapeNavigator:", pin);  // Log PIN

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PhotoEscapeReady"
        component={PhotoEscapeReadyScreen}
        initialParams={{ pin }}  // Pass the pin to the Ready screen
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotoEscapeGame"
        component={PhotoEscapeGameScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotoEscapeResult"
        component={PhotoEscapeResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default PhotoEscapeNavigator;
