import React, { useState } from 'react';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';   // Added Join Game Screen
import CreateGameScreen from './src/screens/CreateGameScreen';  // Added Create Game Screen

// Load custom fonts
const fetchFonts = () => {
  return Font.loadAsync({
    'Doodle-Font': require('./assets/fonts/DoodleFont.ttf'),  // Path to your custom font
  });
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
        onError={(error) => console.log(error)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}  // Hide header for Splash Screen
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}  // Hide header for Login Screen
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}  // Hide header for SignUp Screen
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}  // Hide header for Home Screen
        />
        <Stack.Screen
          name="JoinGame"
          component={JoinGameScreen}
          options={{ headerShown: false }}  // Hide header for Join Game Screen
        />
        <Stack.Screen
          name="CreateGame"
          component={CreateGameScreen}
          options={{ headerShown: false }}  // Hide header for Create Game Screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
