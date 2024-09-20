// App.js

import React, { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SplashScreenComponent from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinGameScreen from './src/screens/JoinGameScreen';
import CreateGameScreen from './src/screens/CreateGameScreen';
import RoomScreen from './src/screens/RoomScreen';
import PhotoEscapeNavigator from './src/games/photoEscape/PhotoEscapeNavigator';  // Import PhotoEscape Navigator

const MainStack = createNativeStackNavigator();  // Main Stack for the app

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'Doodle-Font': require('./assets/fonts/DoodleFont.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <MainStack.Navigator initialRouteName="Splash">
        <MainStack.Screen
          name="Splash"
          component={SplashScreenComponent}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="JoinGame"
          component={JoinGameScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="CreateGame"
          component={CreateGameScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Room"
          component={RoomScreen}
          options={{ headerShown: false }}
        />

        {/* Add PhotoEscape Navigator */}
        <MainStack.Screen
          name="PhotoEscape"
          component={PhotoEscapeNavigator}  // Include the PhotoEscape navigator
          options={{ headerShown: false }}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}
