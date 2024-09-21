import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhotoEscapeReadyScreen from './PhotoEscapeReadyScreen';   // Ready screen
import PhotoEscapeResultScreen from './PhotoEscapeResultScreen'; // Result screen
import PhotoEscapeLimerickScreen from './PhotoEscapeLimerickScreen'; // Limerick screen
import PhotoEscapeCameraScreen from './PhotoEscapeCameraScreen'; // Camera screen
import CongratulationsScreen from './CongratulationsScreen'; // Congratulations screen
import { useRoute } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const PhotoEscapeNavigator = () => {
  const route = useRoute();
  const { pin } = route.params || {};  // Safely access pin

  console.log("PIN received in PhotoEscapeNavigator:", pin);  // Log PIN

  return (
    <Stack.Navigator initialRouteName="PhotoEscapeReady">
      <Stack.Screen
        name="PhotoEscapeReady"
        component={PhotoEscapeReadyScreen}
        initialParams={{ pin }}  // Pass the pin to the Ready screen
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
      {/* Add the CongratulationsScreen to the navigator */}
      <Stack.Screen
        name="CongratulationsScreen"
        component={CongratulationsScreen}
        options={{ headerShown: false }} // You can modify this to show a header if desired
      />
    </Stack.Navigator>
  );
};

export default PhotoEscapeNavigator;
